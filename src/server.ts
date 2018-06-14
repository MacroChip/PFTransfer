import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";

const start = () => {
    const app = express();
    const httpServer = new http.Server(app);
    const io = socketIo(httpServer);

    io.on('connection', (socket) => {
        console.log('a user connected');
    });

    httpServer.listen(8080, () => {
        console.log('listening on *:8080');
    });
};

export {
    start
};
