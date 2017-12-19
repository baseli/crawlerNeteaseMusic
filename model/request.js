/**
 * 封装请求
 */

const request = require('superagent');
const agent = require('../config/agent.json');
const redis = require('./redis.js');
const sleep = require('./sleep.js');
const proxy = require('./proxy')

require('superagent-proxy')(request);
require('superagent-charset')(request);

const key = 'proxy';

/**
 * 封装superagent的请求
 * @param {string} method 
 * @param {string} url 
 */
const requestFunc = async (method, url, cookie, data, referer) => {
    let randomAgent = agent[Math.floor(Math.random() * (agent.length - 1))];
    let proxyAddr = await proxy.get();
    cookie = cookie || '';
    data = data || {};
    referer = referer || '';
    
    if (method == 'get') {
        return new Promise((resolve, reject) => {
            request
                .get(url)
                .set('User-Agent', randomAgent)
                .set('Cookie', cookie)
                .set('Referer', referer)
                .end((e, r) => {
                    if (e || !r.ok || r.status != 200) {
                        reject(e);
                    } else {
                        resolve(r.text);
                    }
                });
        });
    } else {
        return new Promise((resolve, reject) => {
            request[method](url)
                .set('User-Agent', randomAgent)
                .set('Cookie', cookie)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .send(data)
                .end((e, r) => {
                    if (e || !r.ok || r.status != 200) {
                        reject(e);
                    } else {
                        resolve(r.text);
                    }
                });
        });
    }
};

class singleNightmare {
    static getInstance() {
        if (!singleNightmare.instance) {
            // var Xvfb = require('xvfb');

            // var xvfb = new Xvfb({
            //     silent: true
            // });
            // xvfb.startSync();
            singleNightmare.instance = require('./nightmareFix')({
                show: true,
                webPreferences: {
                    images: false
                }
            });
        }

        return singleNightmare.instance;
    }
};

const nightmareFunc = async (url) => {
    const nightmare = singleNightmare.getInstance();
    let proxyAddr = await proxy.get();

    return new Promise((resolve, reject) => {
        nightmare
            // .proxy(proxyAddr)
            .goto(url, {
                Referer: 'http://music.163.com',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
            })
            .wait('#g_iframe')
            .evaluate(function(){
                let dom = document.getElementById('g_iframe').contentDocument.querySelectorAll('html')[0];
                return dom.innerHTML;
            })
            .then(async (content) => {
                // await resolve({content: content, cookie: cookie});
                await resolve(content)
            })
            .catch(function (error) {
                if (error.code == -101) {
                    proxy.remove(proxyAddr);
                }

                // reject(`crawler ${url} faild: ${error}`);
                reject(error);
            });
    });
};

const exitNightmare = () => {
    const nightmare = singleNightmare.getInstance();

    nightmare.halt('close');
}

module.exports = {
    request: requestFunc,
    nightmare: nightmareFunc,
    exit: exitNightmare
};
