import {app, BrowserWindow} from 'electron';

let win;

let createWindow = () => {
    win = new BrowserWindow({width: 800, height: 600});
    win.loadFile('static/index.html');
    // win.webContents.openDevTools()
    win.webContents.on('did-finish-load', () => {
        win.webContents.send('download-path', app.getPath('downloads'))
    })
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
