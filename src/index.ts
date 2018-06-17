import * as argv from "./args";
import * as client from "./client";
import * as server from "./server";
import {app, BrowserWindow} from 'electron';

let win;

let createWindow = () => {
    win = new BrowserWindow({width: 800, height: 600});
    win.loadFile('static/index.html');
    win.on('closed', () => {
        win = null;
    });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

if (argv.argv._[0] === "server") {
    server.start();
} else if (argv.argv._[0] === "send") {
    client.send(argv.argv.f, argv.argv.r, argv.argv.s);
} else if (argv.argv._[0] === "receive") {
    client.receive(argv.argv.f, argv.argv.i, argv.argv.s);
}
