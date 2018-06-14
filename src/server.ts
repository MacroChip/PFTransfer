import * as tls from "tls";
import * as fs from "fs";

const RECEIVING_SOCKET = 8000;

const start = () => {
    const options = {
        pfx: fs.readFileSync('server.pfx'),
        ca: [ fs.readFileSync('server-cert.pem') ],
        rejectUnauthorized: process.env.NODE_ENV != "development",
    };
    
    const server = tls.createServer(options, (socket) => {
        console.log('server connected', socket.authorized ? 'authorized' : 'unauthorized');
        socket.write('welcome!\n');
        socket.setEncoding('utf8');
        socket.pipe(socket);
    });
    server.listen(RECEIVING_SOCKET, () => {
        console.log('listening socket bound');
    });
};

export {
    start
};
