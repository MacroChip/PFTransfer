import * as tls from "tls";
import * as fs from "fs";
import { SENDING_SOCKET, RECEIVING_SOCKET } from "./server";

const start = (socket: number) => {
    const options = {
        rejectUnauthorized: process.env.NODE_ENV != "development",
    };
    
    const client = tls.connect(socket, options, () => {
        console.log('client connected', client.authorized ? 'authorized' : 'unauthorized');
        process.stdin.pipe(client);
        process.stdin.resume(); //not sure what this does
    });
    client.setEncoding('utf8');
    client.on('data', (data) => {
        console.log(data);
    });
};

const send = () => {
    start(SENDING_SOCKET);
};

const receive = () => {
    start(RECEIVING_SOCKET);
};

export {
    send,
    receive
};
