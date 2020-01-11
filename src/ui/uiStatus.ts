import { Status } from "../status";
import * as speedometer from "speedometer";
import * as bytes from "bytes";

export class UiStatus implements Status {
    speed: any;

    progress: HTMLProgressElement = document.getElementById("progress") as HTMLProgressElement;
    status: HTMLInputElement = document.getElementById("status") as HTMLInputElement;
    totalReceived: number = 0;

    start(size: number, label: string) {
        this.speed = speedometer();
        this.progress.max = size;
        this.status.value = label
    }

    stop() {
        this.status.value = "Done";
    }

    message(received: number) {
        this.totalReceived += received;
        this.progress.value = this.totalReceived;
        var bytesPerSecond = this.speed(received)
        this.status.value = bytes.format(bytesPerSecond) + '/second';
    }

}