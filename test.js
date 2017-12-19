#!/usr/bin/env node

const request = require('./model/request');
const cheerio = require('cheerio');
const process = require('process');
const sleep = require('./model/sleep');
const redis = require('./model/redis');
const log = require('./model/log');
const config = require('./config/config.json');

;(async () => {
  try {
    let res = await request.nightmare('http://ip138.com')  

    console.log(res)

    sleep(2)

    await request.nightmare('http://ip138.com')
  } catch (error) {
    console.log(error)
  }
})()