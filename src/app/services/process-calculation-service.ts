import { Injectable } from '@angular/core';
import { ProcessItem } from '../models/process-item';
import { ProcessTimeBlock } from '../models/process-time-block';
import { cloneDeep, min, findLast, orderBy, sortBy } from 'lodash';
import { ProcessSchedulingItem } from '../models/process-scheduling-item';

@Injectable()
export class ProcessCalculationService {
    public calculateByFCFS(processes: ProcessItem[]): ProcessTimeBlock[] {
        const timeBlocks: ProcessTimeBlock[] = [];
        let copiedProcesses = cloneDeep(processes);
        copiedProcesses = sortBy(copiedProcesses, x => x.ArrivalTime);

        let startTime = 0;
        let endTime = 0;
        for (const process of copiedProcesses) {
            startTime = endTime;
            endTime = endTime + process.BurstTime;
            timeBlocks.push(new ProcessTimeBlock(process.Name, startTime, endTime));
        }

        return timeBlocks;
    }

    public calculateBySJF(processes: ProcessItem[]): ProcessTimeBlock[] {
        const timeBlocks: ProcessTimeBlock[] = [];
        const copiedProcesses = cloneDeep(processes);

        let startTime = 0;
        let endTime = 0;
        while (copiedProcesses.length !== 0) {
            let availableProcesses = this.filterAvailableProcesses(copiedProcesses, endTime);
            let minBurstTime = min(availableProcesses.map(x => x.BurstTime));

            // Take the first process with min burst time
            let process = copiedProcesses.find(x => x.BurstTime === minBurstTime);

            startTime = endTime;
            endTime = endTime + process.BurstTime;

            timeBlocks.push(new ProcessTimeBlock(process.Name, startTime, endTime));
            this.removeProcessItemFromCollection(process, copiedProcesses);
        }

        return timeBlocks;
    }

    public calculateBySRTF(processes: ProcessItem[]): ProcessTimeBlock[] {
        const timeBlocks: ProcessTimeBlock[] = [];
        const copiedProcesses = cloneDeep(processes);

        let startTime = 0;
        let endTime = 0;
        let currentProcess: ProcessItem = null;
        while (copiedProcesses.length !== 0) {
            let availableProcesses = this.filterAvailableProcesses(copiedProcesses, endTime);
            let minRemainingTime = min(availableProcesses.map(x => x.BurstTime));

            let minRemainingTimeProcess = copiedProcesses.find(x => x.BurstTime === minRemainingTime);
            if (currentProcess === null) {
                // First run
                currentProcess = minRemainingTimeProcess;
            } else if (currentProcess === minRemainingTimeProcess) {
                // Not pre-empted yet
                endTime += 1;
                currentProcess.BurstTime -= 1;
            } else {
                // A shorter process was found, current process is about to be pre-empted
                timeBlocks.push(new ProcessTimeBlock(currentProcess.Name, startTime, endTime));
                currentProcess = minRemainingTimeProcess;
                startTime = endTime;
            }

            if (currentProcess.BurstTime === 0) {
                this.removeProcessItemFromCollection(currentProcess, copiedProcesses);
            }

            if (copiedProcesses.length === 0) {
                // The last process has finished running
                // But it was not captured by timeBlocks.push above
                // Because it was the only process left so currentProcess === minRemainingTimeProcess
                // So its run will be captured here
                timeBlocks.push(new ProcessTimeBlock(currentProcess.Name, startTime, endTime));
            }
        }

        return timeBlocks;
    }

    public calculateByPS(processes: ProcessItem[]): ProcessTimeBlock[] {
        const timeBlocks: ProcessTimeBlock[] = [];
        const copiedProcesses = cloneDeep(processes);

        let startTime = 0;
        let endTime = 0;
        while (copiedProcesses.length !== 0) {
            let availableProcesses = this.filterAvailableProcesses(copiedProcesses, endTime);
            // 1 highest - n lowest
            let highestPriority = min(availableProcesses.map(x => x.Priority));

            let process = copiedProcesses.find(x => x.Priority === highestPriority);

            startTime = endTime;
            endTime = endTime + process.BurstTime;

            timeBlocks.push(new ProcessTimeBlock(process.Name, startTime, endTime));
            this.removeProcessItemFromCollection(process, copiedProcesses);
        }

        return timeBlocks;
    }

    public calculateByRR(processItems: ProcessItem[]): ProcessTimeBlock[] {
        return [];
    }

    public calculateSchedulingResult(timeBlocks: ProcessTimeBlock[], processes: ProcessItem[]): ProcessSchedulingItem[] {
        let schedulingItems: ProcessSchedulingItem[] = [];

        for (let process of processes) {
            // These find methods assume that timeblocks are already sorted by start time ASC
            // i.e what it looks like in GUI
            let waitingTime = this.calculateWaitingTime(timeBlocks, process);
            let responseTime = this.calculateResponseTime(timeBlocks, process);
            let turnaroundTime = this.calculateTurnaroundTime(timeBlocks, process);

            let schedulingItem = new ProcessSchedulingItem(process.Name, waitingTime, responseTime, turnaroundTime);
            schedulingItems.push(schedulingItem);
        }

        return schedulingItems;
    }

    private calculateWaitingTime(timeBlocks: ProcessTimeBlock[], process: ProcessItem): number {
        let turnaroundTime = this.calculateTurnaroundTime(timeBlocks, process);
        return turnaroundTime - process.BurstTime;
    }

    private calculateResponseTime(timeBlocks: ProcessTimeBlock[], process: ProcessItem): number {
        let timeBlock = timeBlocks.find(x => x.Name === process.Name);
        return timeBlock.StartTime - process.ArrivalTime;
    }

    private calculateTurnaroundTime(timeBlocks: ProcessTimeBlock[], process: ProcessItem): number {
        let timeBlock = findLast(timeBlocks, x => x.Name === process.Name);
        return timeBlock.EndTime - process.ArrivalTime;
    }

    private removeProcessItemFromCollection(item: ProcessItem, collection: ProcessItem[]): void {
        const index = collection.indexOf(item);
        if (index !== -1) {
            collection.splice(index, 1);
        }
    }

    // Can't use .filter() because it returns new array with new reference
    private filterAvailableProcesses(processes: ProcessItem[], endTime: number): ProcessItem[]{
        let availableProcesses  = [];
        for (let i = 0; i < processes.length; i++) {
            if (processes[i].ArrivalTime <= endTime) {
                availableProcesses.push(processes[i]);
            }
        }

        return availableProcesses;
    }
}