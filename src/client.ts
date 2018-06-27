import * as fs from "fs";
import * as socketio from "socket.io-client";
var Peer = require('simple-peer');
var wrtc = require('wrtc');

const send = (filename: string, recipient: string, server: string, callback?: Function) => {
    const socket = socketio.connect(server);
    socket.emit('sender');
    // socket.emit('send file', recipient);
    // let stream = fs.createReadStream(filename); //default chunk size
    // socket.on('receiver ready', () => {
    //     stream.on('end', () => {
    //         console.log('Read all data.');
    //         socket.emit('transfer complete');
    //         if (callback) callback();
    //     });
    //     stream.on('error', (error) => {
    //         console.log('Error reading data.');
    //         if (callback) callback(error);
    //     });
    //     stream.on('data', (data) => {
    //         socket.emit('file data', data);
    //     });
    // });
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
        p.send('sender to receiver')
    })

    p.on('data', function (data) {
        console.log('data: ' + data)
    })
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
        p.send('receiver to sender')
    })

    p.on('data', function (data) {
        console.log('data: ' + data)
    })
    // socket.on('transfer complete', () => {
    //     console.log("transfer complete. Writing data", fullFileData);
    //     fs.writeFileSync(overwriteFilename, fullFileData);
    //     if (callback) callback();
    // });
    // socket.on('file data', chunk => {
    //     console.log("received chunk", chunk.toString());
    //     fullFileData += chunk;
    // });
    // socket.emit("receive ready", identity);
};

export {
    send,
    receive
};
