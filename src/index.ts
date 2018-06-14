import * as tls from "tls";
import * as fs from "fs";

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
server.listen(8000, () => {
    console.log('server bound');
    const client = tls.connect(8000, options, () => {
        console.log('client connected', client.authorized ? 'authorized' : 'unauthorized');
        process.stdin.pipe(client);
        process.stdin.resume(); //not sure what this does
    });
    client.setEncoding('utf8');
    client.on('data', (data) => {
        console.log(data);
    });
    client.on('end', () => {
        server.close();
    });
});
