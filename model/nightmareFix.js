const Nightmare = require('nightmare');

Nightmare.action('proxy',
  function(name, options, parent, win, renderer, done) {
    parent.respondTo('proxy', function(host, done) {
      win.webContents.session.setProxy({
          proxyRules: 'http=' + host + ';https='+ host +';ftp=' + host,

      }, function() {
          done();
      });
    });

    done();
  },
  function(host, done) {
      this.child.call('proxy', host, done);
  });

module.exports = Nightmare;