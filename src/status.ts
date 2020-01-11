export interface Status {
    start(size: number, label: string);
    stop();
    message(received: number);
}