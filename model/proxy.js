/**
 * 爬取代理ip地址，并且进行筛选
 */

const request = require('superagent');
const cheerio = require('cheerio');
const process = require('process');

const agent = require('../config/agent.json');

const redis = require('./redis.js');

require('superagent-proxy')(request);
require('superagent-charset')(request);
const key = 'proxy';


let randomAgent = agent[Math.floor(Math.random() * (agent.length - 1))];

const getProxyList = (url, fb) => {
    request
    .get(url)
    .set('User-Agent', randomAgent)
    .end((error, result) => {
        if (error || !result.ok) {
            console.log(error);
        } else {
            fb(result.text);
        }
    });
}

const check = (ipaddr, port, ways) => {
    let proxy = ways + '://' + ipaddr + ':' + port;
    let randomAgent = agent[Math.floor(Math.random() * (agent.length - 1))];

    if (proxy === '://:') {
        return;
    }
    
    request
        .get('http://1212.ip138.com/ic.asp')
        .set('User-Agent', randomAgent)
        .proxy(proxy)
        .charset('utf-8')
        .timeout(5000)
        .end((error, res) => {
            if (error || !res.ok) {
                // TODO
            } else {
                var $ = cheerio.load(res.text);

                if ($('div[align="center"]').text()) {
                    console.log(proxy);
                    let ret = redis.set(key, proxy);
                }
            }
        });
}

const deleteProxy = async (value) => {
    return await redis.remove(key, value);
};

const getProxy = async () => {
    return await redis.randomGet(key);
}

module.exports = {
    getProxyList: getProxyList,
    check: check,
    remove: deleteProxy,
    get: getProxy
}