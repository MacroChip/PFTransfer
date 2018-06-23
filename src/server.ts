import * as express from "express";
import { Server } from "http";
import * as socketIo from "socket.io";
import { Socket } from "socket.io";
const p2p = require('socket.io-p2p-server').Server;
const uuidv4 = require('uuid/v4');

const start = () => {
    const app = express();
    const httpServer = new Server(app);
    const io = socketIo(httpServer);
    // io.use(p2p);

    let receiver: Socket;
    let intendedReceiverId: string;
    let reportedRecieverId: string;
    let roomName: string = uuidv4();

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
        socket.on('send file', (recipient: string) => {
            intendedReceiverId = recipient;
            socket.join(roomName);
            p2p(socket, null, { "name": roomName });
            console.log("sender connected");
            if (reportedRecieverId && reportedRecieverId === recipient) {
                connectReceiverToExistingRoom(receiver);
            }
        });
        socket.on('receive ready', (identity: string) => {
            if (intendedReceiverId && identity === intendedReceiverId) {
                connectReceiverToExistingRoom(socket);
            } else if (!intendedReceiverId) {
                reportedRecieverId = identity;
                receiver = socket;
            }
        });
    });
    console.log("starting server");
    httpServer.listen(8080, () => {
        console.log('listening on *:8080');
    });

    let connectReceiverToExistingRoom = (socket: Socket) => {
        console.log("sending");
        socket.join(roomName);
        p2p(socket, null, { "name": roomName });
    };
};

export {
    start
};
