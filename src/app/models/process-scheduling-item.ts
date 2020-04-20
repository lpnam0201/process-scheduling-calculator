export class ProcessSchedulingItem {
    constructor(
        public Name: string,
        public WaitingTime: number,
        public ResponseTime: number,
        public TurnaroundTime: number) { }
}