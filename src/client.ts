import * as fs from "fs";
import * as socketio from "socket.io-client";
import * as Peer from 'simple-peer';
// import * as wrtc from 'wrtc';
import * as unusedFilename from "unused-filename";
import * as path from "path";
import { Metadata } from "./save/metadata";
import { Status } from "./status";

const send = (filename: string, recipient: string, server: string, status: Status, callback?: Function) => {
    console.log(`sending ${filename} to ${recipient}`);
    const socket = socketio.connect(server);
    socket.emit('sender', recipient);
    var p = new Peer({ initiator: true, trickle: true })
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
        var stats = fs.statSync(filename)
        var fileSizeInBytes = stats["size"]
        p.send(JSON.stringify({ metadata: {
            filename: path.basename(filename),
            filesize: fileSizeInBytes
        }}));
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

const receive = (saveOptions: SaveOptions, identity: string, server: string, status: Status, callback: (err: NodeJS.ErrnoException) => void) => {
    console.log(`settings ${JSON.stringify(saveOptions)} as ${identity}`);
    const socket = socketio.connect(server);
    socket.emit('receiver', identity);
    var p = new Peer({ initiator: false, trickle: true })
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
            status.start(metadata.filesize);
            const fullPath = unusedFilename.sync(path.join(saveOptions.path, saveOptions.overwriteName || metadata.filename || "pftransfer-download"));
            console.log(`Saving file as ${fullPath}`)
            stream = fs.createWriteStream(fullPath, { flags: "wx" })
            stream.on('error', (error) => {
                console.log("error writing file: " + error);
                callback(error);
            })
        } else {
            status.message(data.length)
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
