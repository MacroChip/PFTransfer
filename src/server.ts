import * as tls from "tls";
import * as fs from "fs";

const RECEIVING_SOCKET = 8000;
const SENDING_SOCKET = 8001;

const start = () => {
    const options = {
        pfx: fs.readFileSync('server.pfx'),
    };
    
    const server = tls.createServer(options, (socket) => {
        console.log('client connected', socket.authorized ? 'authorized' : 'unauthorized');
        console.log(socket.address())
        socket.write('welcome!\n');
        socket.setEncoding('utf8');
        socket.pipe(socket);
    });
    server.listen(RECEIVING_SOCKET, () => {
        console.log('listening socket bound');
    });
    server.listen(SENDING_SOCKET, () => {
        console.log('sending socket bound');
    });
};

export {
    start,
    RECEIVING_SOCKET,
    SENDING_SOCKET
};
