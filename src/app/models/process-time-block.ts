export class ProcessTimeBlock {
    constructor(
        public Name: string,
        public StartTime: number,
        public EndTime: number) {}

    public Duration: number = this.EndTime - this.StartTime;
    public IsFirstBlock: boolean = this.StartTime === 0;
}