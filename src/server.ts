import * as express from "express";
import { Server } from "http";
import * as socketIo from "socket.io";
import { Socket } from "socket.io";

const start = () => {
    const app = express();
    const httpServer = new Server(app);
    const io = socketIo(httpServer);

    let senders: Exchanger[] = [];
    let receivers: Exchanger[] = [];

    let exchanges: Exchange[] = []; //not threadsafe

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
        socket.on('sender', (recipient) => {
            let newExchanger = new Exchanger();
            senders[socket.id] = newExchanger;
            newExchanger.role = "sender";
            newExchanger.socket = socket;
            if (!exchanges[recipient]) {
                exchanges[recipient] = new Exchange(recipient);
            }
            exchanges[recipient].sender = newExchanger;
        });
        socket.on('sender signal', (data) => {
            console.log("sender signal");
            senders[socket.id].signalData.push(data);
            sendSignalData();
        });
        socket.on('receiver signal', (data) => {
            console.log("receiver signal");
            receivers[socket.id].signalData.push(data);
            sendSignalData();
        });
        socket.on('receiver', (id) => {
            let newExchanger = new Exchanger();
            receivers[socket.id] = newExchanger;
            newExchanger.role = 'receiver';
            newExchanger.socket = socket;
            if (!exchanges[id]) {
                exchanges[id] = new Exchange(id);
            }
            exchanges[id].receiver = newExchanger; //TODO: make sure the existing exchange is complete before doing this. If the other people are mid exchange it would break both the old and new people
            sendSignalData();
        });
    });
    console.log("starting server");
    const port = process.env.PORT || 8080;
    httpServer.listen(port, () => {
        console.log('listening on *:' + port);
    });

    let sendSignalData = () => {
        for (let exchange in exchanges) { //TODO I don't need to loop over all of them every time. Only for the ones that changed
            let item = exchanges[exchange];
            if (item.sender && item.receiver) {
                item.sender.signalData.forEach(signal => {
                    item.receiver.socket.emit('sender signal', signal);
                });
                item.sender.signalData = [];

                item.receiver.signalData.forEach(signal => {
                    item.sender.socket.emit('receiver signal', signal);
                });
                item.receiver.signalData = [];
            }
        }
    };
};

class Exchanger {
    role: 'sender' | 'receiver';
    socket: Socket; //should probably just store the id
    signalData = [];
}

class Exchange {

    constructor(id){
        this.id = id;
    }

    id: string;
    sender: Exchanger;
    receiver: Exchanger;
}

export {
    start
};
