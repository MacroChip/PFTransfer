import * as express from "express";
import { Server } from "http";
import * as socketIo from "socket.io";
import { Socket } from "socket.io";

const start = () => {
    const app = express();
    const httpServer = new Server(app);
    const io = socketIo(httpServer);

    let exchanges: Exchange[] = [];

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
        socket.on('sender', (recipient) => {
            let newExchange = new Exchange();
            exchanges[socket.id] = newExchange;
            newExchange.role = "sender";
            newExchange.socket = socket;
            newExchange.intendedReceiverId = recipient;
        });
        socket.on('sender signal', (data) => {
            console.log("sender signal");
            exchanges[socket.id].signalData.push(data);
            sendSignalData(exchanges);
        });
        socket.on('receiver signal', (data) => {
            console.log("receiver signal");
            exchanges[socket.id].signalData.push(data);
            sendSignalData(exchanges);
        });
        socket.on('receiver', (id) => {
            let newExchange = new Exchange();
            exchanges[socket.id] = newExchange;
            newExchange.role = 'receiver';
            newExchange.socket = socket;
            newExchange.reportedReceiverId = id;
            sendSignalData(exchanges);
        });
    });
    console.log("starting server");
    const port = process.env.PORT || 8080;
    httpServer.listen(port, () => {
        console.log('listening on *:' + port);
    });

    let sendSignalData = (exchanges) => {
        for (let key1 in exchanges) {
            let item = exchanges[key1];
            for (let key2 in exchanges) {
                let item2 = exchanges[key2];
                if ((item.intendedReceiverId === item2.reportedReceiverId || item.reportedReceiverId === item2.intendedReceiverId) && item.signalData.length > 0) {
                    item.signalData.forEach(signal => {
                        item2.socket.emit(item.role + ' signal', signal);
                    });
                    item.signalData = [];
                }
            }
        }
    };
};

class Exchange {
    role: 'sender' | 'receiver';
    socket: Socket;
    signalData = [];
    intendedReceiverId: string;
    reportedReceiverId: string;
}

export {
    start
};
