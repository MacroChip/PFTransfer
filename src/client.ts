import * as tls from "tls";
import * as fs from "fs";

const start = () => {
    const options = {
        pfx: fs.readFileSync('server.pfx'),
        ca: [ fs.readFileSync('server-cert.pem') ],
        rejectUnauthorized: process.env.NODE_ENV != "development",
    };
    
    const client = tls.connect(8000, options, () => {
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
    start();
};

const receive = () => {
    start();
};

export {
    send,
    receive
};
