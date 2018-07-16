import * as client from "../client";

import { ipcRenderer } from 'electron'
import { UiStatus } from "./uiStatus";
const {BrowserWindow} = require('electron').remote
const {session} = require('electron').remote

let downloadPath = ".";

ipcRenderer.once('download-path', (event, arg) => {
    downloadPath = arg
    console.log(`download path set to: ${downloadPath}`)
})

const serverUrl = process.env.PROTOCOL + process.env.HOSTNAME || "https://pftransfer.herokuapp.com";

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("send").addEventListener("click", () => {
        client.send((<HTMLInputElement>document.getElementById("sendFilename")).files[0].path, (<HTMLInputElement>document.getElementById("receiverId")).value, serverUrl, new UiStatus(), session, (error, url) => {
            return new Promise((res, rej) => {
                let win = new BrowserWindow({width: 800, height: 600})
                win.on('closed', () => {
                    win = null

                    session.defaultSession.cookies.get({}, (error, cookies) => {
                        console.log(error, cookies)
                    })
                    res();
                })
                win.loadURL(url)
            });
        });
    });
    document.getElementById("receive").addEventListener("click", () => {
        client.receive({ path: downloadPath }, serverUrl, new UiStatus(), (error) => {
            console.log("done: " + error);
        });
    });
});
