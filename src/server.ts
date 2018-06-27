import * as express from "express";
import { Server } from "http";
import * as socketIo from "socket.io";
import { Socket } from "socket.io";

const start = () => {
    const app = express();
    const httpServer = new Server(app);
    const io = socketIo(httpServer);

    let sender: Socket;
    let senderSignalData = [];
    let receiver: Socket;
    let receiverSignalData = [];
    let intendedReceiverId: string;
    let reportedReceiverId: string;

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
        socket.on('sender', (recipient) => {
            sender = socket;
            intendedReceiverId = recipient;
            senderSignalData = [];
        });
        socket.on('sender signal', (data) => {
            console.log("sender signal");
            senderSignalData.push(data);
            sendSignalData();
        });
        socket.on('receiver signal', (data) => {
            console.log("receiver signal");
            receiver = socket;
            receiverSignalData.push(data);
            sendSignalData();
        });
        socket.on('receiver', (id) => {
            receiver = socket;
            reportedReceiverId = id;
            receiverSignalData = [];
            sendSignalData();
        });
    });
    console.log("starting server");
    httpServer.listen(8080, () => {
        console.log('listening on *:8080');
    });

    let sendSignalData = () => {
        if (sender && receiver && intendedReceiverId === reportedReceiverId && senderSignalData.length > 0) {
            senderSignalData.forEach(item => {
                receiver.emit('sender signal', item);
            });
            senderSignalData = [];
        } else if (sender && receiver && intendedReceiverId === reportedReceiverId && receiverSignalData.length > 0) {
            receiverSignalData.forEach(item => {
                sender.emit('receiver signal', item);
            });
            receiverSignalData = [];
        }
    };
};

export {
    start
};
