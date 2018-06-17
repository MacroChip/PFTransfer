import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";

const start = () => {
    const app = express();
    const httpServer = new http.Server(app);
    const io = socketIo(httpServer);

    let lastFilenameSent;
    let sender;
    let receiver;

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('send file', (filename) => {
            lastFilenameSent = filename;
            sender = socket;
            console.log("holding", lastFilenameSent);
            if (receiver != undefined) {
                console.log("sending", lastFilenameSent);
                sender.emit('receiver ready');
            }
        });
        socket.on('receive ready', () => {
            receiver = socket;
            if (sender != undefined) {
                console.log("sending", lastFilenameSent);
                sender.emit('receiver ready', lastFilenameSent);
            }
        });
        socket.on('file data', chunk => {
            console.log('relaying chunk', chunk.toString());
            receiver.emit('file data', chunk);
        });
        socket.on('transfer complete', chunk => {
            console.log('transfer complete');
            receiver.emit('transfer complete');
        });
    });

    httpServer.listen(8080, () => {
        console.log('listening on *:8080');
    });
};

export {
    start
};
