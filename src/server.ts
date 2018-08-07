import * as express from "express";
import { Server } from "http";
import * as socketIo from "socket.io";
import { Socket } from "socket.io";
import * as passportConfig from "./passportConfig";
import passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const env = {
    AUTH0_CLIENT_ID: 'eu5i0gLvltEIgq7XMGeeSbuH2loHMFsJ',
    AUTH0_DOMAIN: 'pftransfer.auth0.com',
    AUTH0_CALLBACK_URL: 'http://localhost:3000/callback'
  };
const start = () => {
    const app = express();
    passportConfig.preparePassport(app, passport);
    const httpServer = new Server(app);
    const io = socketIo(httpServer);

    let senders: Exchanger[] = [];
    let receivers: Exchanger[] = [];

    let exchanges: Exchange[] = [];

    app.get('/callback', passport.authenticate('auth0', { failureRedirect: '/login' }), (req: any, res) => {
        if (!req.user) {
            throw new Error('user null');
        }
        res.status(200).send("Success! Close this window to continue");
    });

    app.get('/friends', ensureLoggedIn, (req, res) => {
        res.send(['thottie1']);
    });

    app.get('/login', passport.authenticate('auth0', {
        clientID: env.AUTH0_CLIENT_ID,
        domain: env.AUTH0_DOMAIN,
        redirectUri: env.AUTH0_CALLBACK_URL,
        audience: 'https://' + env.AUTH0_DOMAIN + '/userinfo',
        responseType: 'code',
        scope: 'openid'
    }), (req, res) => {
        res.send("you are logged in");
    });

    app.put('/send', ensureLoggedIn, (req: any, res) => {
        if (areFriends(req.user.id, req.body.recipient)) {
            if (!exchanges[req.body.recipient]) {
                exchanges[req.body.recipient] = new Exchange(req.body.recipient);
            }
            exchanges[req.body.recipient].sender = senders[req.body.socketId]
        }
        res.send()
    });

    app.put('/receive', ensureLoggedIn, (req: any, res) => {
        if (!exchanges[req.user.id]) {
            exchanges[req.user.id] = new Exchange(req.user.id);
        }
        exchanges[req.user.id].receiver = receivers[req.body.socketId] //TODO: make sure the existing exchange is complete before doing this. If the other people are mid exchange it would break both the old and new people
        res.send()
        sendSignalData();
    });

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
        socket.on('sender', (ack) => {
            let newExchanger = new Exchanger();
            senders[socket.id] = newExchanger;
            newExchanger.socket = socket;
            console.log("sender received")
            ack();
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
        socket.on('receiver', (ack) => {
            let newExchanger = new Exchanger();
            receivers[socket.id] = newExchanger;
            newExchanger.socket = socket;
            ack();
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

    var areFriends = (friend1, friend2): boolean => {
        return true;
    };
};

class Exchanger {
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
