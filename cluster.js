/**
 * 多进程运行js文件，通过参数指定执行文件的路径
 */
const cluster = require('cluster');
const process = require('process');
const exec = require('child_process').exec;
const cpus = require('os').cpus().length;

var filePath = process.argv[2] || '';

if (filePath === '') {
    console.log('invalid file path!');
    process.exit();
} else {
    if (cluster.isMaster) {
        console.log(`Master ${process.pid} is master!`);

        var workers = [];
        var count = 0;

        // fork
        for (let i = 0; i < cpus; i++) {
            workers[i] = cluster.fork();
        }

        cluster.on('exit', (worker, code, single) => {
            count++;
            
            if (count == cpus) {
                process.exit(1);
            }
        });
    } else {
        try {
            exec('node ' + filePath, (error, stdout, stderr) => {
                if (error || stdout || stderr) {
                    process.exit(1);
                }
            });
        } catch(error) {
            // console.log(error);
            process.exit(1);
        }

        console.log(`Worker ${process.pid} started!`);
    }
}