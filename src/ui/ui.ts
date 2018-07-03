import * as client from "../client";
import fetch from 'node-fetch';
import * as unusedFilename from "unused-filename";
import * as path from "path";

import { ipcRenderer } from 'electron'

let downloadPath = ".";

ipcRenderer.once('download-path', (event, arg) => {
    downloadPath = arg
    console.log(`download path set to: ${downloadPath}`)
})

const serverUrl = "https://pftransfer.herokuapp.com";

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("startServer").addEventListener("click", () => {
        fetch(serverUrl)
            .then(res => (<HTMLInputElement>document.getElementById("status")).value = "SERVER SHOULD BE READY")
            .catch(err => (<HTMLInputElement>document.getElementById("status")).value = err);
    });
    document.getElementById("send").addEventListener("click", () => {
        client.send((<HTMLInputElement>document.getElementById("sendFilename")).files[0].path, (<HTMLInputElement>document.getElementById("receiverId")).value, serverUrl, (error) => {
            console.log("done", error);
        });
    });
    document.getElementById("receive").addEventListener("click", () => {
        client.receive(unusedFilename.sync(path.join(downloadPath, "pftransfer-download.txt")), (<HTMLInputElement>document.getElementById("myId")).value, serverUrl, (error) => {
            console.log("done", error);
        });
    });
});
