import { Status } from "../status";
import { Spinner } from "clui";
import * as speedometer from "speedometer";
import * as bytes from "bytes";

export class CliStatus implements Status {
    status: Spinner;
    speed: any;

    start(size: number) {
        this.speed = speedometer();
        this.status = new Spinner('Downloading', ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'].reverse());
        this.status.start();
    }

    stop() {
        this.status.stop();
    }

    message(received: number) {
        var bytesPerSecond = this.speed(received)
        this.status.message(bytes.format(bytesPerSecond) + '/second');
    }

}