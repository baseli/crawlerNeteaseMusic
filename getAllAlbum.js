#!/usr/bin/env node

const request = require('./model/request');
const cheerio = require('cheerio');
const process = require('process');
const sleep = require('./model/sleep');
const redis = require('./model/redis');
const log = require('./model/log');
const config = require('./config/config.json');
const getKeyName = 'allArtists';
const setKeyName = 'allAlbums';

;(async () => {
  while (true) {
    let value = await redis.get(getKeyName);

    if (value != null) {
      try {
        let url = `http://music.163.com/#/artist/album?id=${value}&limit=1000`;
        let res = await request.nightmare(url);
        let $ = cheerio.load(res);
        let result = [];
        
        $('.msk').each(function() {
          let id = $(this).attr('href').match(/\d{1,}/)

          if (id) {
            result.push(parseInt(id[0]));
          }
        });

        if (result.length > 0) {
          redis.set(setKeyName, ...result);
        }

        await log.success(`crawler ${value} success, result: ${JSON.stringify(result)}.`);
        // process.exit(0);
      } catch (error) {
        await log.error(`crawler ${value} error.`);
        // process.exit(0);
      } finally {
        sleep(20);
      }
    }
  }
})()