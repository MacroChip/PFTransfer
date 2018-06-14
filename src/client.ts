import * as socketio from "socket.io-client";

const start = () => {
    const socket = socketio.connect("http://localhost:8080");
    socket.emit('chat message', "XD");
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
