import * as fs from "fs";
const P2P = require('socket.io-p2p');
var wrtc = require('wrtc')
import * as socketio from "socket.io-client";

const send = (filename: string, recipient: string, server: string, callback?: Function) => {
    const socket = socketio.connect(server);
    socket.emit('send file', recipient);
    const p2p = new P2P(socket, { peerOpts: {
        initiator: true,
        "wrtc": wrtc
    }}, () => {
        console.log("upgraded");
        p2p.usePeerConnection = true;
        p2p.on('receiver ready', () => {
            console.log("got receiver ready");
            let stream = fs.createReadStream(filename); //default chunk size
            stream.on('end', () => {
                console.log('Read all data.');
                p2p.emit('transfer complete');
                if (callback) callback();
            });
            stream.on('error', (error) => {
                console.log('Error reading data.');
                if (callback) callback(error);
            });
            stream.on('data', (data) => {
                p2p.emit('file data', data);
            });
        });
    });
};

const receive = (overwriteFilename: string, identity: string, server: string, callback?: Function) => {
    const socket = socketio.connect(server);
    socket.emit("receive ready", identity);
    let fullFileData = "";
    const p2p = new P2P(socket, { peerOpts: {
        "wrtc": wrtc
    }}, () => {
        console.log("upgraded");
        p2p.usePeerConnection = true;
        p2p.emit('receiver ready');
        p2p.on('transfer complete', () => {
            console.log("transfer complete. Writing data", fullFileData);
            fs.writeFileSync(overwriteFilename, fullFileData);
            if (callback) callback();
        });
        p2p.on('file data', chunk => {
            console.log("received chunk", chunk.toString());
            fullFileData += chunk;
        });
    });
};

export {
    send,
    receive
};
