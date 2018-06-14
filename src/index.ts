import * as argv from "./args";
import * as client from "./client";
import * as server from "./server";

if (argv.argv._[0] === "server") {
    server.start();
} else if (argv.argv._[0] === "send") {
    client.send();
} else if (argv.argv._[0] === "receive") {
    client.receive();
}
