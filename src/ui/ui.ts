import * as client from "../client";

import { ipcRenderer } from 'electron'
import { UiStatus } from "./uiStatus";

let downloadPath = ".";

ipcRenderer.once('download-path', (event, arg) => {
    downloadPath = arg
    console.log(`download path set to: ${downloadPath}`)
})

const serverUrl = "https://pftransfer.herokuapp.com";

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("send").addEventListener("click", () => {
        client.send((<HTMLInputElement>document.getElementById("sendFilename")).files[0].path, (<HTMLInputElement>document.getElementById("receiverId")).value, serverUrl, new UiStatus(), (error) => {
            console.log("done: " + error);
        });
    });
    document.getElementById("receive").addEventListener("click", () => {
        client.receive({ path: downloadPath }, serverUrl, new UiStatus(), (error) => {
            console.log("done: " + error);
        });
    });
});
