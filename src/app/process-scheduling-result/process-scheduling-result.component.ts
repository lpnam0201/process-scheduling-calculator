import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProcessSchedulingItem } from '../models/process-scheduling-item';
import { ProcessSchedulingProviderService } from '../services/process-scheduling-provider-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-process-scheduling-result',
  templateUrl: './process-scheduling-result.component.html',
  styleUrls: ['./process-scheduling-result.component.css']
})
export class ProcessSchedulingResultComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public processSchedulingItems: ProcessSchedulingItem[] = [];
  public get averageWaitingTime(): string {
    return this.findAverage(x => x.WaitingTime);
  }
  public get averageResponseTime(): string {
    return this.findAverage(x => x.ResponseTime);
  }
  public get averageTurnaroundTime(): string {
    return this.findAverage(x => x.TurnaroundTime);
  }

  constructor(private processSchedulingProviderService: ProcessSchedulingProviderService) { }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    const subscription = this.processSchedulingProviderService.processSchedulingItemsCalculated
      .subscribe(schedulingItems => {
        this.processSchedulingItems = schedulingItems;
      });
    this.subscriptions.push(subscription);
  }

  private findAverage(propertySelctor: (value: ProcessSchedulingItem) => number): string {
    let average = this.processSchedulingItems
      .map(propertySelctor)
      .reduce((previous, current) => previous + current)
      / this.processSchedulingItems.length;

    return average.toFixed(2);
  }
}
