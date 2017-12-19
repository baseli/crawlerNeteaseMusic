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

const url = 'http://www.xicidaili.com/nn/1';
const key = 'proxy';


let randomAgent = agent[Math.floor(Math.random() * (agent.length - 1))];

request
    .get(url)
    .set('User-Agent', randomAgent)
    .end((error, result) => {
        if (error || !result.ok) {

        } else {
            var $ = cheerio.load(result.text);

            let res = redis.del(key);

            res.then(() => {
                $('#ip_list').find('tr').not('first').each(function() {
                    let ipaddr = $(this).find('td').eq(1).text().replace(/ /g, '');
                    let port = $(this).find('td').eq(2).text().replace(/ /g, '');
                    let ways = $(this).find('td').eq(5).text().replace(/ /g, '');

                    check(ipaddr, port, ways);
                });    
            });
        }
    });

var check = (ipaddr, port, ways) => {
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
        .timeout(20000)
        .end((error, res) => {
            if (error || !res.ok) {

            } else {
                var $ = cheerio.load(res.text);

                if ($('div[align="center"]').text()) {
                    let ret = redis.set(key, proxy);
                }
            }
        });
}