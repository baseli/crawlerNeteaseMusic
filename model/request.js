/**
 * 封装请求
 */

const request = require('superagent');
const agent = require('../config/agent.json');
const redis = require('./redis.js');
const sleep = require('./sleep.js');

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
    let proxy = await redis.get(key);
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

const getProxy = async () => {
    return await redis.get(key);
}

class singleNightmare {
    static getInstance() {
        if (!singleNightmare.instance) {
            // var Xvfb = require('xvfb');

            // var xvfb = new Xvfb({
            //     silent: true
            // });
            // xvfb.startSync();
            let proxy = getProxy();
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

    return new Promise((resolve, reject) => {
        nightmare
            .proxy('HTTP://125.211.202.26:53281')
            .goto(url)
            .wait('#g_iframe')
            .evaluate(function(){
                let dom = document.getElementById('g_iframe').contentDocument.querySelectorAll('html')[0];
                return dom.innerHTML;
            })
            .end()
            .then(async (content) => {
                // await resolve({content: content, cookie: cookie});
                await resolve(content)
            })
            .catch(function (error) {
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
