import * as fs from "fs";
import * as socketio from "socket.io-client";
import * as Peer from 'simple-peer';
import * as wrtc from 'wrtc';
import * as unusedFilename from "unused-filename";
import * as path from "path";
import * as speedometer from "speedometer";
import { Spinner } from "clui";
import * as bytes from "bytes";
import { Metadata } from "./save/metadata";

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
        console.log('SIGNAL ' + JSON.stringify(data))
        socket.emit('sender signal', JSON.stringify(data));
    })

    socket.on('receiver signal', (data) => {
        p.signal(JSON.parse(data));
    });

    p.on('connect', () => {
        console.log('CONNECT')
        p.send(JSON.stringify({ metadata: { filename: path.basename(filename) } }));
        let stream = fs.createReadStream(filename);
        stream.on('end', () => {
            console.log('Read all data.');
            p.send('transfer complete');
            if (callback) callback();
        });
        stream.on('error', (error) => {
            console.log('Error reading data.');
            if (callback) callback(error);
        });
        stream.pipe(p, { end: false });
    });
};

const receive = (saveOptions: SaveOptions, identity: string, server: string, callback: (err: NodeJS.ErrnoException) => void) => {
    const speed = speedometer();
    const status = new Spinner('Downloading', ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'].reverse());
    console.log(`settings ${JSON.stringify(saveOptions)} as ${identity}`);
    const socket = socketio.connect(server);
    socket.emit('receiver', identity);
    var p = new Peer({ initiator: false, trickle: true, wrtc: wrtc })
    let stream;
    p.on('error', (err) => {
        console.log('error:' + err);
        callback(err);
    })
    p.on('signal', (data) => {
        console.log('SIGNAL ' + JSON.stringify(data))
        socket.emit('receiver signal', JSON.stringify(data));
    });
    socket.on('sender signal', (data) => {
        p.signal(JSON.parse(data));
    });
    p.on('connect', () => {
        console.log('CONNECT')
        status.start();
    })
    p.on('data', (data) => {
        let metadata: Metadata = tryMetadata(data);  //TODO: reorganize if statements so that this isn't done every time
        if (data.toString() === 'transfer complete') {
            console.log("transfer complete.");
            status.stop();
            stream.end(() => {
                console.log("file written")
                callback(null);
            });
        } else if (metadata) {
            const fullPath = unusedFilename.sync(path.join(saveOptions.path, saveOptions.overwriteName || metadata.filename || "pftransfer-download"));
            stream = fs.createWriteStream(fullPath, { flags: "wx" })
            stream.on('error', (error) => {
                console.log("error writing file: " + error);
                callback(error);
            })
        } else {
            var bytesPerSecond = speed(data.length)
            status.message(bytes.format(bytesPerSecond) + '/second')
            stream.write(Buffer.from(data)) //TODO: respect backpressure. TODO: consider piping into file
        }
    })

    let tryMetadata = (data) => {
        try {
            return JSON.parse(data.toString()).metadata;
        } catch (e) {
        }
    };
};

export {
    send,
    receive
};
