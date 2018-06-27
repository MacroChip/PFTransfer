import * as express from "express";
import { Server } from "http";
import * as socketIo from "socket.io";
import { Socket } from "socket.io";

const start = () => {
    const app = express();
    const httpServer = new Server(app);
    const io = socketIo(httpServer);

    let sender: Socket;
    let senderSignalData;
    let receiver: Socket;
    let receiverSignalData;
    let intendedReceiverId: string;
    let reportedReceiverId: string;

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
        socket.on('sender', () => {
            sender = socket;
        });
        socket.on('sender signal', (data) => {
            console.log("sender signal");
            senderSignalData = data;
            sendSignalData();
        });
        socket.on('receiver signal', (data) => {
            console.log("receiver signal");
            receiver = socket;
            receiverSignalData = data;
            sendSignalData();
        });
        socket.on('receiver', () => {
            receiver = socket;
            sendSignalData();
        });
    });
    console.log("starting server");
    httpServer.listen(8080, () => {
        console.log('listening on *:8080');
    });

    let sendSignalData = () => {
        if (sender && receiver && senderSignalData) {
            receiver.emit('sender signal', senderSignalData);
            senderSignalData = null;
        } else if (sender && receiver && receiverSignalData) {
            sender.emit('receiver signal', receiverSignalData);
            receiverSignalData = null;
        }
    };
};

export {
    start
};
