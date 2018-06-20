import * as client from "../client";
import * as server from "../server";

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("startServer").addEventListener("click", () => {
        server.start();
    });
});
