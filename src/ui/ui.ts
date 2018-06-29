import * as client from "../client";
import * as server from "../server";

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("startServer").addEventListener("click", () => {
        server.start();
    });
    document.getElementById("send").addEventListener("click", () => {
        client.send((<HTMLInputElement>document.getElementById("sendFilename")).value, (<HTMLInputElement>document.getElementById("receiverId")).value, 'http://localhost:8080', (error) => {
            console.log("done", error);
        });
    });
    document.getElementById("receive").addEventListener("click", () => {
        client.receive((<HTMLInputElement>document.getElementById("receiveFilename")).value, (<HTMLInputElement>document.getElementById("myId")).value, 'http://localhost:8080', (error) => {
            console.log("done", error);
        });
    });
});
