#!/usr/bin/env node

const request = require('./model/request');
const cheerio = require('cheerio');
const process = require('process');
const sleep = require('./model/sleep');
const redis = require('./model/redis');
const config = require('./config/config.json');

let data = {
  params: 'Ak2s0LoP1GRJYqE3XxJUZVYK9uPEXSTttmAS+8uVLnYRoUt/Xgqdrt/13nr6OYhi75QSTlQ9FcZaWElIwE+oz9qXAu87t2DHj6Auu+2yBJDr+arG+irBbjIvKJGfjgBac+kSm2ePwf4rfuHSKVgQu1cYMdqFVnB+ojBsWopHcexbvLylDIMPulPljAWK6MR8',
  encSecKey: '8c85d1b6f53bfebaf5258d171f3526c06980cbcaf490d759eac82145ee27198297c152dd95e7ea0f08cfb7281588cdab305946e01b9d84f0b49700f9c2eb6eeced8624b16ce378bccd24341b1b5ad3d84ebd707dbbd18a4f01c2a007cd47de32f28ca395c9715afa134ed9ee321caa7f28ec82b94307d75144f6b5b134a9ce1a'
}

;(async () => {
  try {
    // let res = await request.request('post', 'http://music.163.com/weapi/v1/resource/comments/R_SO_4_468176711?csrf_token=',
    // '', data, 'music.163.com');
    // let ret = JSON.parse(res);

    // console.log(ret.total)
    let res = await request.nightmare('http://music.163.com/#/discover/artist/cat?id=1002');
    let $ = cheerio.load(res);
    let result = [];
    let list = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 0];

    $('.cat-flag').each(function() {
      let href = $(this).attr('href');

      if (href.includes('?id=')) {
        let id = href.match(/\d{1,}/)[0];

        list.forEach(v => {
          result.push(`http://music.163.com/discover/artist/cat?id=${id}&initial=${v}`)
        })
      }
      
      request.exit();
    });

    if (result.length > 0) {
      redis.set('artist', ...result);
    }

    process.exit(0);
  } catch (error) {
      console.log(error);
  }
})();
