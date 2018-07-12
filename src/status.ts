export interface Status {
    start(size: number);
    stop();
    message(received: number);
}