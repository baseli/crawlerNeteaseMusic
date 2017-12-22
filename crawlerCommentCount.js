#!/usr/bin/env node

const cluster = require('cluster');
const request = require('./model/request');
const cheerio = require('cheerio');
const process = require('process');
const sleep = require('./model/sleep');
const redis = require('./model/redis');
const log = require('./model/log');
const config = require('./config/config.json');
const {transaction} = require('./model/pgsql');
const cpus = require('os').cpus().length;
const getKeyName = 'allSongs';

const data = {
  params: 'Ak2s0LoP1GRJYqE3XxJUZVYK9uPEXSTttmAS+8uVLnYRoUt/Xgqdrt/13nr6OYhi75QSTlQ9FcZaWElIwE+oz9qXAu87t2DHj6Auu+2yBJDr+arG+irBbjIvKJGfjgBac+kSm2ePwf4rfuHSKVgQu1cYMdqFVnB+ojBsWopHcexbvLylDIMPulPljAWK6MR8',
  encSecKey: '8c85d1b6f53bfebaf5258d171f3526c06980cbcaf490d759eac82145ee27198297c152dd95e7ea0f08cfb7281588cdab305946e01b9d84f0b49700f9c2eb6eeced8624b16ce378bccd24341b1b5ad3d84ebd707dbbd18a4f01c2a007cd47de32f28ca395c9715afa134ed9ee321caa7f28ec82b94307d75144f6b5b134a9ce1a'
};

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程。
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {
  ;(async () => {
    while(true) {
      try {
        let id = await redis.get(getKeyName);
    
        if (id != null) {
          let res = await request.request('post', `http://music.163.com/weapi/v1/resource/comments/R_SO_4_${id}?csrf_token=`,
          '', data);
    
          if (res) {
            let result = JSON.parse(res);
    
            transaction((client) => {
              client.query(`update l_songs set comment_count = ${result.total} where id = ${id}`);
            })

            console.log(`crawler ${id} success.`);
          }
        }
      } catch (error) {
        console.log(`crawler ${id} faild: error`);
      } finally {
        sleep(5);
      }
    }
  })() 
}