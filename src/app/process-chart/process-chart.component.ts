import { Component, OnInit, OnDestroy } from '@angular/core';
import { TimeBlockProviderService } from '../services/time-block-provider-service';
import { ProcessTimeBlock } from '../models/process-time-block';
import { Subscription } from 'rxjs';
import { min } from 'lodash';

@Component({
  selector: 'app-process-chart',
  templateUrl: './process-chart.component.html',
  styleUrls: ['./process-chart.component.css']
})
export class ProcessChartComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public processTimeBlocks: ProcessTimeBlock[] = [];
  public pixelPerSecond: number = 10;

  constructor(private timeBlockProviderService: TimeBlockProviderService) { }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {
    const subscription = this.timeBlockProviderService.timeBlocksCalculated
      .subscribe(timeBlocks => {
        this.processTimeBlocks = timeBlocks;
      });
    this.subscriptions.push(subscription);
  }

}
