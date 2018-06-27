import * as client from "../client";
import * as server from "../server";

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("startServer").addEventListener("click", () => {
        server.start();
    });
    document.getElementById("send").addEventListener("click", () => {
        client.send("text.txt", "xdboi", 'http://localhost:8080', (error) => {
            console.log("done", error);
        });
    });
    document.getElementById("receive").addEventListener("click", () => {
        client.receive("fdsx.txt", "xdboi", 'http://localhost:8080', (error) => {
            console.log("done", error);
        });
    });
});
