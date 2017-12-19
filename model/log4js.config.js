module.exports = {
  appenders: {
    out: { type: 'console' },
    task: {
      type: 'file',
      filename: 'logs/crawler.log',
      alwaysIncludePattern: true
    }
  },
  categories: {
    default: { appenders: [ 'out' ], level: 'info' },
    task: { appenders: [ 'task' ], level: 'info' }
  }
}