import { ProcessTimeBlock } from '../models/process-time-block';
import { Subject } from 'rxjs';

export class TimeBlockProviderService {
    private timeBlocksSource = new Subject<ProcessTimeBlock[]>();
    public timeBlocksCalculated = this.timeBlocksSource.asObservable();

    public emit(processTimeBlocks: ProcessTimeBlock[]): void {
        this.timeBlocksSource.next(processTimeBlocks);
    }
}