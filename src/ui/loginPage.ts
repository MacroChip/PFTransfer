const {BrowserWindow} = require('electron').remote

export class Login {

    login = (error, url): Promise<any> => {
        return new Promise((res, rej) => {
            let win = new BrowserWindow({width: 800, height: 600, webPreferences: {
                partition: "persist:auth0"
            }})
            let cookieMap = {}; //WARN has collisions between names on different domains
            // win.webContents.session.cookies.on('changed', (event, newCookie, cause, removed) => { //does this listener need to be removed?
            //     if (removed) {
            //         cookieMap[newCookie.name] = null;
            //     } else {
            //         cookieMap[newCookie.name] = newCookie;
            //     }
            // })
            win.on('closed', () => {
                win = null
                res(cookieMap);
            })
            win.loadURL(url)
        });
    };
}
