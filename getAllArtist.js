#!/usr/bin/env node

const request = require('./model/request');
const cheerio = require('cheerio');
const process = require('process');
const eagles = require('./model/eagles');
const sleep = require('./model/sleep');
const redis = require('./model/redis');
const log = require('./model/log');
const config = require('./config/config.json');
const getKeyName = 'artist';
const setKeyName = 'allArtists';

;(async () => {
  while (true) {
    let value = await redis.get('artist');

    if (value != null) {
      try {
        let res = await request.nightmare(value);
        let $ = cheerio.load(res);
        let result = [];
        
        $('.sml > a').each(function() {
          let id = $(this).attr('href').match(/\d{1,}/)

          if (id) {
            result.push(parseInt(id[0]));
          }
        });

        await log.success(`crawler ${value} success, result: ${JSON.stringify(result)}.`);
        // process.exit(0);
      } catch (error) {
        log.error(`crawler ${value} error.`);
        // process.exit(0);
      } finally {
        sleep(20);
        console.log(123);
      }
    }
  }
})()