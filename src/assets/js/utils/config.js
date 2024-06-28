/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 */

const pkg = require('../package.json');
const nodeFetch = require("node-fetch");
const convert = require('xml-js');
let url = pkg.user ? `${pkg.url}/${pkg.user}` : pkg.url

let config = `${url}/launcher/config-launcher/config.json`;
let news = `https://geantworld.c1.is/api/rss`;

class Config {
    GetConfig() {
        return new Promise((resolve, reject) => {
            nodeFetch(config).then(async config => {
                if (config.status === 200) return resolve(config.json());
                else return reject({ error: { code: config.statusText, message: 'server not accessible' } });
            }).catch(error => {
                return reject({ error });
            })
        })
    }

    async getInstanceList() {
        let urlInstance = `${url}/files`
        let instances = await nodeFetch(urlInstance).then(res => res.json()).catch(err => err)
        let instancesList = []
        instances = Object.entries(instances)

        for (let [name, data] of instances) {
            let instance = data
            instance.name = name
            instancesList.push(instance)
        }
        return instancesList
    }

    async getNews() {
        this.config = await this.GetConfig().then(res => res);
        let news = `https://minecraft.skybeworld.com/api/rss`
        let rss = await fetch(news).then(res => res.text());
        let rssparse = JSON.parse(convert.xml2json(rss, { compact: true }));
        let data = [];
    
        // Vérifier si des articles sont disponibles
        if (rssparse.rss.channel.item) {
            // Si c'est un tableau, parcourir chaque élément
            if (Array.isArray(rssparse.rss.channel.item)) {
                for (let i of rssparse.rss.channel.item) {
                    let item = {}
                    item.title = i.title._text;
                    item.content = i['content:encoded']._text;
                    item.author = i['dc:creator']._text;
                    item.publish_date = i.pubDate._text;
                    data.push(item);
                }
            } else {
                // Sinon, il n'y a qu'un seul article, traitez-le comme un tableau
                let item = {}
                item.title = rssparse.rss.channel.item.title._text;
                item.content = rssparse.rss.channel.item['content:encoded']._text;
                item.author = rssparse.rss.channel.item['dc:creator']._text;
                item.publish_date = rssparse.rss.channel.item.pubDate._text;
                data.push(item);
            }
        } else {
            // Aucun article disponible, ajoutez un message ou faites autre chose
            data.push({
                title: "Aucun article disponible",
                content: "Aucun article n'a été trouvé.",
                author: "News",
                publish_date: "2023"
            });
        }
    
        return data;
    }
}

export default new Config;