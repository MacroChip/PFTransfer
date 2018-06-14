import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";

const start = () => {
    const app = express();
    const httpServer = new http.Server(app);
    const io = socketIo(httpServer);

    let lastFileSent;

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('send file', (file: Buffer) => {
            lastFileSent = file.toString();
            console.log("holding", lastFileSent);
        });
        socket.on('receive ready', () => {
            if (lastFileSent != undefined) {
                console.log("sending", lastFileSent);
                socket.emit('receive file', lastFileSent);
            }
        });
    });

    httpServer.listen(8080, () => {
        console.log('listening on *:8080');
    });
};

export {
    start
};
