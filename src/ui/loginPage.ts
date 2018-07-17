const {BrowserWindow} = require('electron').remote

export class Login {

    login = (error, url): Promise<any> => {
        return new Promise((res, rej) => {
            let win = new BrowserWindow({width: 800, height: 600})
            win.on('closed', () => {
                win = null
                res();
            })
            win.loadURL(url)
        });
    };
}
