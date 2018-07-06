import * as argv from "./args";
import * as client from "./client";
import * as server from "./server";

let main = () => {
    if (argv.argv._[0] === "server") {
        server.start();
    } else if (argv.argv._[0] === "send") {
        client.send(argv.argv.f, argv.argv.r, argv.argv.s);
    } else if (argv.argv._[0] === "receive") {
        client.receive({ path: ".", overwriteName: argv.argv.f}, argv.argv.i, argv.argv.s, (err) => {
            console.log("done: " + err);
        });
    }
};

main();
