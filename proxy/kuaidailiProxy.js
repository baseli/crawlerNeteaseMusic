const proxy = require('../model/proxy');
const cheerio = require('cheerio');

const url = 'http://www.kuaidaili.com/free/inha/1/';
const callback = (ret) => {
  var $ = cheerio.load(ret);

  $('#ip_list').find('tr').not('first').each(function() {
      let ipaddr = $(this).find('td').eq(1).text().replace(/ /g, '');
      let port = $(this).find('td').eq(2).text().replace(/ /g, '');
      let ways = $(this).find('td').eq(5).text().replace(/ /g, '');
      console.log(ipaddr, port, ways);
      // proxy.check(ipaddr, port, ways);
  });
}

proxy.getProxyList(url, callback);
