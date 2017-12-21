#!/usr/bin/env node

const request = require('./model/request');
const cheerio = require('cheerio');
const process = require('process');
const sleep = require('./model/sleep');
const redis = require('./model/redis');
const log = require('./model/log');
const config = require('./config/config.json');
const {transaction} = require('./model/pgsql');
const getKeyName = 'allArtists';
const setKeyName = 'allAlbums';

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
        let url = `http://music.163.com/#/artist/album?id=${value}&limit=1000`;
        let res = await request.nightmare(url);
        let $ = cheerio.load(res);
        let result = [];

        $('#m-song-module > li').each(function() {
          let $info = $(this).find('.tit.s-fc0');

          let id = $info.attr('href').match(/\d{1,}/);

          if (id) {
            let name = $info.text();
            let date = $(this).find('.s-fc3').text();
            let cover = $(this).find('img').attr('src') || '';
  
            result.push({
              id: id[0],
              name: name,
              date: date,
              cover: cover
            });
          }
        });

        if (result.length > 0) {
          await transaction((client) => {
            result.forEach(v => {
              client.query('insert into l_albums (id, singer_id, name, datetime, cover_image, comment_count) values ($1, $2, $3, $4, $5, $6)', [v.id, value, v.name, v.date, v.cover, 0]);
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