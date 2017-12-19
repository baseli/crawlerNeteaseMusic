const childProcess = require('child_process');

module.exports = (s) => {
    childProcess.execSync('sleep ' + s);
};