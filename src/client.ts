import * as fs from "fs";
import * as socketio from "socket.io-client";

const start = () => {
    const socket = socketio.connect("http://localhost:8080");
    socket.emit('file', fs.readFileSync('text.txt'));
};

const send = () => {
    start();
};

const receive = () => {
    start();
};

export {
    send,
    receive
};
