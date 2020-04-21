import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ProcessTimeBlock } from '../models/process-time-block';

@Component({
  selector: 'app-process-time-block',
  templateUrl: './process-time-block.component.html',
  styleUrls: ['./process-time-block.component.css']
})
export class ProcessTimeBlockComponent implements OnInit {
  @Input() processTimeBlock: ProcessTimeBlock;
  @Input() pixelPerSecond: number;
  get width(): number {
    return this.processTimeBlock.Duration  * this.pixelPerSecond;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
