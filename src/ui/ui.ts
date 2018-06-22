import * as client from "../client";
import * as server from "../server";

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("startServer").addEventListener("click", () => {
        server.start(); //this works
    });
    document.getElementById("send").addEventListener("click", () => {
        client.send("text.txt", "xdboi", 'http://localhost:8080', (error) => { //this works. tested by doing the receive in the cli and sending here
            console.log("done", error);
        });
    });
    document.getElementById("receive").addEventListener("click", () => {
        client.receive("fdsx.txt", "xdboi", 'http://localhost:8080', (error) => { //this does not work. tested by doing send in the cli and receive here.
            console.log("done", error);
        });
    });
});
