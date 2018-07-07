import * as fs from "fs";
import * as socketio from "socket.io-client";
import * as Peer from 'simple-peer';
import * as wrtc from 'wrtc';
import * as unusedFilename from "unused-filename";
import * as path from "path";

const send = (filename: string, recipient: string, server: string, callback?: Function) => {
    console.log(`sending ${filename} to ${recipient}`);
    const socket = socketio.connect(server);
    socket.emit('sender', recipient);
    var p = new Peer({ initiator: true, trickle: true, wrtc: wrtc })
    p.on('error', (err) => {
        console.log('error: ' + err);
        if (callback) callback(err);
    })

    p.on('signal', (data) => {
        console.log('SIGNAL', JSON.stringify(data))
        socket.emit('sender signal', JSON.stringify(data));
    })

    socket.on('receiver signal', (data) => {
        p.signal(JSON.parse(data));
    });

    p.on('connect', () => {
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

const receive = (saveOptions: SaveOptions, identity: string, server: string, callback: (err: NodeJS.ErrnoException) => void) => {
    const fullPath = unusedFilename.sync(path.join(saveOptions.path, saveOptions.overwriteName || "pftransfer-download.txt"));
    console.log(`saving name ${fullPath} to ${saveOptions.path} as ${identity}`);
    const socket = socketio.connect(server);
    socket.emit('receiver', identity);
    var p = new Peer({ initiator: false, trickle: true, wrtc: wrtc })
    const stream = fs.createWriteStream(fullPath, { flags: "wx" })
    stream.on('error', (error) => {
        console.log("error writing file: " + error);
        callback(error);
    })
    p.on('error', (err) => {
        console.log('error:' + err);
        callback(err);
    })
    p.on('signal', (data) => {
        console.log('SIGNAL', JSON.stringify(data))
        socket.emit('receiver signal', JSON.stringify(data));
    });
    socket.on('sender signal', (data) => {
        p.signal(JSON.parse(data));
    });
    p.on('connect', () => {
        console.log('CONNECT')
    })
    p.on('data', (data) => {
        if (data.toString() === 'transfer complete') {
            console.log("transfer complete.");
            stream.end(() => {
                console.log("file written")
                callback(null);
            });
        } else {
            stream.write(Buffer.from(data)); //TODO: respect backpressure and draining
        }
    })
};

export {
    send,
    receive
};
