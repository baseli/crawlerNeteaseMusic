#!/bin/bash
# start crawler proxy url

start() {
    while :
    do
        node ./model/getProxy.js & > /dev/null 2>&1
        sleep 300
        stop
    done
    
}

stop() {
    count=`ps -ef | grep node | grep -v grep | wc -l`

    if [ $count -gt 0 ]; then
        ps -ef | grep getProxy | grep -v grep | awk '{printf $2" "}' | xargs kill -9 > /dev/null 2>&1
        sleep 1
    fi
}

start
