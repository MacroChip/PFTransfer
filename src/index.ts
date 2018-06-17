import * as argv from "./args";
import * as client from "./client";
import * as server from "./server";

if (argv.argv._[0] === "server") {
    server.start();
} else if (argv.argv._[0] === "send") {
    client.send(argv.argv.f, argv.argv.r);
} else if (argv.argv._[0] === "receive") {
    client.receive(argv.argv.f, argv.argv.i);
}
