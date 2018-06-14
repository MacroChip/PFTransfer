import * as fs from "fs";
import * as socketio from "socket.io-client";

const send = () => {
    const socket = socketio.connect("http://localhost:8080");
    socket.emit('send file', fs.readFileSync('text.txt'));
};

const receive = () => {
    const socket = socketio.connect("http://localhost:8080");
    socket.on('receive file', (file) => {
        fs.writeFileSync("received-file.txt", file);
        console.log("received file done");
    });
    socket.emit("receive ready");
};

export {
    send,
    receive
};
