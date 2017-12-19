/**
 * 日志
 */
const log4js = require('log4js');
const config = require('./log4js.config')

class singleLog {
    static getInstance() {
        if (! singleLog.instance) {
            log4js.configure(config);
            const logger = log4js.getLogger('task');

            singleLog.instance = logger;
        }

        return singleLog.instance;
    }
};

const success = async (message) => {
    const logger = singleLog.getInstance();

    await logger.info(message);
};

const error = async (message) => {
    const logger = singleLog.getInstance();

    await logger.fatal(message);
};

module.exports = {
    success: success,
    error: error
};