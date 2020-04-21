import { Component, OnInit } from '@angular/core';
import { ProcessItem } from '../models/process-item';
import { ProcessCalculationService } from '../services/process-calculation-service';
import { TimeBlockProviderService } from '../services/time-block-provider-service';
import { ProcessTimeBlock } from '../models/process-time-block';
import { ProcessSchedulingProviderService } from '../services/process-scheduling-provider-service';

@Component({
  selector: 'app-process-input',
  templateUrl: './process-input.component.html',
  styleUrls: ['./process-input.component.css']
})
export class ProcessInputComponent implements OnInit {
  private internalSelectedAlgorithm: string;
  public get selectedAlgorithm(): string {
    return this.internalSelectedAlgorithm;
  }
  public set selectedAlgorithm(value: string) {
    if (value === 'PS') {
      this.isPriorityUsed = true;
    } else {
      this.isPriorityUsed = false;
      this.processItems.forEach(x => {
        x.Priority = null;
      });
    }

    if (value === 'RR') {
      this.isRoundRobin = true;
    } else {
      this.isRoundRobin = false;
      this.quantum = null;
    }

    this.internalSelectedAlgorithm = value;
  }
  algorithms: string[] = ['FCFS', 'SJF', 'SRTF', 'PS', 'RR'];
  processItems: ProcessItem[] = [];
  isPriorityUsed: boolean = false;
  isRoundRobin: boolean = false;
  quantum: number;

  constructor(
    private processCalculationService: ProcessCalculationService,
    private timeBlockProviderService: TimeBlockProviderService,
    private processSchedulingProviderService: ProcessSchedulingProviderService) { }

  ngOnInit(): void {
  }

  onAddProcessItem(): void {
    const processItem = new ProcessItem();
    processItem.Name = this.generateNextName();

    this.processItems.push(processItem);
  }

  onDeleteProcessItem(processItem: ProcessItem): void {
    const index = this.processItems.indexOf(processItem);
    if (index !== -1) {
      this.processItems.splice(index, 1);
    }

    this.processItems.forEach((item, i) => {
      item.Name = 'P' + (i + 1).toString();
    });
  }

  generateNextName(): string {
    return 'P' + (this.processItems.length + 1).toString();
  }

  onClickStart(): void {
    let timeBlocks: ProcessTimeBlock[] = [];
    switch (this.internalSelectedAlgorithm) {
      case 'FCFS':
        timeBlocks = this.processCalculationService.calculateByFCFS(this.processItems);
        break;
      case 'SJF':
        timeBlocks = this.processCalculationService.calculateBySJF(this.processItems);
        break;
      case 'SRTF':
        timeBlocks = this.processCalculationService.calculateBySRTF(this.processItems);
        break;
      case 'PS':
        timeBlocks = this.processCalculationService.calculateByPS(this.processItems);
        break;
      case 'RR':
        timeBlocks = this.processCalculationService.calculateByRR(this.processItems, this.quantum);
        break;
      default:
        break;
    }

    this.timeBlockProviderService.emit(timeBlocks);
    const schedulingItems = this.processCalculationService.calculateSchedulingResult(timeBlocks, this.processItems);
    this.processSchedulingProviderService.emit(schedulingItems);
  }
}
