import * as express from "express";
import { Server } from "http";
import * as socketIo from "socket.io";
import { Socket } from "socket.io";

const start = () => {
    const app = express();
    const httpServer = new Server(app);
    const io = socketIo(httpServer);

    let lastFilenameSent: string;
    let sender: Socket;
    let receiver: Socket;
    let intendedReceiverId: string;
    let reportedReceiverId: string;

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
        socket.on('send file', (filename: string, recipient: string) => {
            lastFilenameSent = filename;
            sender = socket;
            intendedReceiverId = recipient;
            console.log("holding", lastFilenameSent);
            if (receiver != undefined && intendedReceiverId === reportedReceiverId) {
                console.log("sending", lastFilenameSent);
                sender.emit('receiver ready');
            }
        });
        socket.on('receive ready', (identity: string) => {
            receiver = socket;
            reportedReceiverId = identity;
            if (sender != undefined && intendedReceiverId === reportedReceiverId) {
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
    console.log("starting server");
    httpServer.listen(8080, () => {
        console.log('listening on *:8080');
    });
};

export {
    start
};
