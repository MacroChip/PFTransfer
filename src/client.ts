import * as fs from "fs";
import * as socketio from "socket.io-client";

const send = (filename: string, recipient: string) => {
    const socket = socketio.connect("http://localhost:8080");
    socket.emit('send file', filename);
    let stream = fs.createReadStream(filename); //default chunk size
    socket.on('receiver ready', () => {
        stream.on('end', () => {
            console.log('Read all data.');
            socket.emit('transfer complete');
        });
        stream.on('error', () => {
            console.log('Error reading data.');
        });
        stream.on('data', (data) => {
            socket.emit('file data', data);
        });
    });
};

const receive = (overwriteFilename: string) => {
    const socket = socketio.connect("http://localhost:8080");
    let fullFileData = "";
    socket.on('transfer complete', () => {
        console.log("transfer complete. Writing data", fullFileData);
        fs.writeFileSync(overwriteFilename, fullFileData);
    });
    socket.on('file data', chunk => {
        console.log("received chunk", chunk.toString());
        fullFileData += chunk;
    });
    socket.emit("receive ready");
};

export {
    send,
    receive
};
