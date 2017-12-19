/**
 * 封装操作redis的相关方法
 * 用redis的列表实现一个FIFO，用来主程序在进行爬虫的时候获取网址
 */

const redis = require('ioredis');
const path = require('path');
const ROOT_PATH = path.resolve(__dirname, '..');
const config = require(ROOT_PATH + path.sep + 'config' + path.sep + 'config.json');
const redisClient = new redis('redis://' + config.REDIS_HOST + ':' + config.REDIS_PORT);

redisClient.on('error', (error) => {
    console.log(`Redis error: ${error}`);
});

/**
 * 向FIFO中插入数据
 * @param {*} project 
 * @param {*} value 
 */
const set = async (project, value) => {
    let res = await redisClient.rpush(project, value);

    return res;
};

/**
 * 从FIFO中提取数据
 * @param {*} project 
 */
const get = async (project) => {
    let res = await redisClient.lpop(project);

    return res;
};

/**
 * 获取FIFO的长度
 * @param {*} project 
 */
const len = async (project) => {
    let res = await redisClient.llen(project);

    return res;
}

/**
 * 向集合中插入数据
 * @param {*} key 
 * @param {*} value 
 */
const setDataToSet = async (key, ...value) => {
    let res = await redisClient.sadd(key, ...value);

    return res;
}

/**
 * 从集合中随机返回数据
 * @param {*} key 
 */
const getDataFromSet = async (key) => {
    let res = await redisClient.spop(key);

    return res;
}

const removeItemFromSet = async (key, value) => {
    return await redisClient.srem(key, value);
}

const randomGet = async (key) => {
    return await redisClient.srandmember(key);
}

const flushSet = async (key) => {
    let res = await redisClient.del(key);

    return res;
}

module.exports = {
    setItem: set,
    getItem: get,
    itemLength: len,
    set: setDataToSet,
    get: getDataFromSet,
    del: flushSet,
    randomGet: randomGet,
    remove: removeItemFromSet
};