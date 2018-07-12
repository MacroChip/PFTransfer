import { Status } from "../status";

export class UiStatus implements Status {

    progress: HTMLProgressElement = document.getElementById("progress") as HTMLProgressElement;
    totalReceived: number = 0;

    start(size: number) {
        this.progress.max = size;
    }

    stop() {
    }

    message(received: number) {
        this.totalReceived += received;
        this.progress.value = this.totalReceived;
    }

}