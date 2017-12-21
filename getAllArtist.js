#!/usr/bin/env node

const request = require('./model/request');
const cheerio = require('cheerio');
const process = require('process');
const sleep = require('./model/sleep');
const redis = require('./model/redis');
const log = require('./model/log');
const config = require('./config/config.json');
const {transaction} = require('./model/pgsql');
const getKeyName = 'artist';
const setKeyName = 'allArtists';

;(async () => {
  while (true) {
    let value = await redis.get('artist');

    if (value == null) {
      let length  = await redis.setLength(getKeyName);

      if (length == 0) {
        process.exit(0);
      }
    } else {
      try {
        let res = await request.nightmare(value);
        let $ = cheerio.load(res);
        let result = [];
        
        $('.msk').each(function() {
          let id = $(this).attr('href').match(/\d{1,}/);
          let name = $(this).attr('title');
          name = name.replace('的音乐', '');

          if (id) {
            result.push({
              id: parseInt(id[0]),
              name: name
            });
          }
        });

        $('.sml > a.s-fc0').each(function() {
          let id = $(this).attr('href').match(/\d{1,}/);
          let name = $(this).text();

          if (id) {
            result.push({
              id: parseInt(id[0]),
              name: name
            });
          }
        });

        if (result.length > 0) {
          await transaction((client) => {
            result.forEach(v => {
              client.query('insert into l_singers (id, name) values ($1, $2)', [v.id, v.name]);
            });
          });

          let ids = result.map(v => v.id);
          redis.set(setKeyName, ...ids);
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