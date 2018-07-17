import * as argv from "./args";
import * as client from "./client";
import * as server from "./server";
import { CliStatus } from "./cli/cliStatus";

let main = () => {
    if (argv.argv._[0] === "server") {
        server.start();
    } else if (argv.argv._[0] === "send") {
        client.send(argv.argv.f, argv.argv.r, argv.argv.s, new CliStatus(), null, (err) => {
            console.log(err)
        });
    } else if (argv.argv._[0] === "receive") {
        client.receive({ path: ".", overwriteName: argv.argv.f}, argv.argv.s, new CliStatus(), null, (err) => {
            console.log("done: " + err);
        });
    }
};

main();
