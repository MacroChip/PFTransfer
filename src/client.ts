import * as fs from "fs";
import * as socketio from "socket.io-client";

const send = (filename: string, recipient: string) => {
    const socket = socketio.connect("http://localhost:8080");
    socket.emit('send file', fs.readFileSync(filename));
};

const receive = (filename: string) => {
    const socket = socketio.connect("http://localhost:8080");
    socket.on('receive file', (file) => {
        fs.writeFileSync(filename, file);
        console.log("received file done");
    });
    socket.emit("receive ready");
};

export {
    send,
    receive
};
