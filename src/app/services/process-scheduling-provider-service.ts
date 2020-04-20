import { ProcessSchedulingItem } from '../models/process-scheduling-item';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class ProcessSchedulingProviderService {
    private processSchedulingItemsSource = new Subject<ProcessSchedulingItem[]>();
    public processSchedulingItemsCalculated = this.processSchedulingItemsSource.asObservable();

    public emit(processSchedulingItems: ProcessSchedulingItem[]): void {
        this.processSchedulingItemsSource.next(processSchedulingItems);
    }
}