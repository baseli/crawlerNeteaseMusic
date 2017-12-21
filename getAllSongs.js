#!/usr/bin/env node

const request = require('./model/request');
const cheerio = require('cheerio');
const process = require('process');
const sleep = require('./model/sleep');
const redis = require('./model/redis');
const log = require('./model/log');
const config = require('./config/config.json');
const {transaction} = require('./model/pgsql');
const getKeyName = 'allAlbums';
const setKeyName = 'allSongs';

;(async () => {
  while (true) {
    let value = await redis.get(getKeyName);

    if (value == null) {
      let length  = await redis.setLength(getKeyName);

      if (length == 0) {
        process.exit(0);
      }
    } else {
      try {
        let url = `http://music.163.com/#/album?id=${value}`;
        let res = await request.nightmare(url);
        let $ = cheerio.load(res);
        let result = [];

        let singerId = $('.topblk .s-fc7').attr('href').match(/\d{1,}/);

        if (! singerId) {
          continue;
        }

        singerId = singerId[0];
        $('#song-list-pre-cache .txt').each(function() {
          let $info = $(this).find('a');

          let id = $info.attr('href').match(/\d{1,}/);

          if (id) {
            let name = $info.find('b').attr('title');
  
            result.push({
              id: id[0],
              name: name,
            });
          }
        });

        if (result.length > 0) {
          await transaction((client) => {
            result.forEach(v => {
              client.query('insert into l_songs (id, singer_id, name) values ($1, $2, $3)', [v.id, singerId, v.name]);
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