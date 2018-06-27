import * as fs from "fs";
import * as socketio from "socket.io-client";
import * as Peer from 'simple-peer';
var wrtc = require('wrtc');

const send = (filename: string, recipient: string, server: string, callback?: Function) => {
    const socket = socketio.connect(server);
    socket.emit('sender');
    var p = new Peer({ initiator: true, trickle: true, wrtc: wrtc })
    p.on('error', function (err) { console.log('error', err) })

    p.on('signal', function (data) {
        console.log('SIGNAL', JSON.stringify(data))
        socket.emit('sender signal', JSON.stringify(data));
    })

    socket.on('receiver signal', (data) => {
        p.signal(JSON.parse(data));
    });

    p.on('connect', function () {
        console.log('CONNECT')
        let stream = fs.createReadStream(filename); //default chunk size
        stream.on('end', () => {
            console.log('Read all data.');
            p.send('transfer complete');
            if (callback) callback();
        });
        stream.on('error', (error) => {
            console.log('Error reading data.');
            if (callback) callback(error);
        });
        stream.on('data', (data) => {
            p.send(data);
        });
    });
};

const receive = (overwriteFilename: string, identity: string, server: string, callback?: Function) => {
    const socket = socketio.connect(server);
    socket.emit('receiver');
    var p = new Peer({ initiator: false, trickle: true, wrtc: wrtc })
    p.on('error', function (err) { console.log('error', err) })
    p.on('signal', function (data) {
        console.log('SIGNAL', JSON.stringify(data))
        socket.emit('receiver signal', JSON.stringify(data));
    });
    let fullFileData = "";
    socket.on('sender signal', (data) => {
        p.signal(JSON.parse(data));
    });
    p.on('connect', function () {
        console.log('CONNECT')
    })
    p.on('data', (data) => {
        console.log(data)
        if (typeof data === 'string' && data === 'transfer complete') {
            console.log("transfer complete. Writing data", fullFileData);
            fs.writeFileSync(overwriteFilename, fullFileData);
            if (callback) callback();
        } else {
            console.log("received chunk", data);
            fullFileData += data;
        }
    })
};

export {
    send,
    receive
};
