import { Status } from "../status";
import { Spinner } from "clui";
import * as speedometer from "speedometer";
import * as bytes from "bytes";
import * as readline from "readline";

export class CliStatus implements Status {
    status: Spinner;
    speed: any;
    rl: any;
    totalSize: number;
    currentSize: number = 0;

    start(size: number, label: string) {
        this.speed = speedometer();
        this.status = new Spinner(label, ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'].reverse());
        this.status.start();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.totalSize = size;
    }

    stop() {
        this.status.stop();
    }

    message(received: number) {
        var bytesPerSecond = this.speed(received)
        this.status.message(bytes.format(bytesPerSecond) + '/second');
        readline.moveCursor(this.rl, 0, -1)
        readline.cursorTo(this.rl, 0);
        this.currentSize += received;
        process.stdout.write(this.progressBar(this.currentSize / this.totalSize));
        readline.moveCursor(this.rl, 0, 1)
    }

    progressBar(percent) {
        percent = Math.floor(percent * 100);
        let str = `%${percent}[`;
        str += '='.repeat(percent);
        str += '>'
        str += ' '.repeat(Math.max(99 - percent, 0));
        str += '] ';
        return str
    }

}