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
            if (process.ArrivalTime > endTime) {
                startTime = endTime;
                endTime = process.ArrivalTime;
                timeBlocks.push(new ProcessTimeBlock('-', startTime, process.ArrivalTime));
            }

            startTime = endTime;
            endTime = startTime + process.BurstTime;
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
            if (availableProcesses.length === 0)
            {
                let nextProcess = this.findProcessWithMinArrivalTime(copiedProcesses);
                startTime = endTime;
                endTime = nextProcess.ArrivalTime;
                timeBlocks.push(new ProcessTimeBlock('-', startTime, endTime));
                availableProcesses = this.filterAvailableProcesses(copiedProcesses, endTime);
            }

            let minBurstTime = min(availableProcesses.map(x => x.BurstTime));

            // Take the first process with min burst time
            let process = availableProcesses.find(x => x.BurstTime === minBurstTime);

            startTime = endTime;
            endTime = startTime + process.BurstTime;

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
            if (availableProcesses.length === 0)
            {
                let nextProcess = this.findProcessWithMinArrivalTime(copiedProcesses);
                startTime = endTime;
                endTime = nextProcess.ArrivalTime;
                timeBlocks.push(new ProcessTimeBlock('-', startTime, endTime));
                availableProcesses = this.filterAvailableProcesses(copiedProcesses, endTime);
            }

            let minRemainingTime = min(availableProcesses.map(x => x.BurstTime));

            let minRemainingTimeProcess = availableProcesses.find(x => x.BurstTime === minRemainingTime);
            if (currentProcess === null) {
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
                timeBlocks.push(new ProcessTimeBlock(currentProcess.Name, startTime, endTime));
                this.removeProcessItemFromCollection(currentProcess, copiedProcesses);
                currentProcess = null;
                startTime = endTime;
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
            if (availableProcesses.length === 0)
            {
                let nextProcess = this.findProcessWithMinArrivalTime(copiedProcesses);
                startTime = endTime;
                endTime = nextProcess.ArrivalTime;
                timeBlocks.push(new ProcessTimeBlock('-', startTime, endTime));
                availableProcesses = this.filterAvailableProcesses(copiedProcesses, endTime);
            }

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

    public calculateByRR(processes: ProcessItem[], quantum: number): ProcessTimeBlock[] {
        const timeBlocks: ProcessTimeBlock[] = [];
        // const copiedProcesses = cloneDeep(processes);
        // const processQueue = [];

        // let firstProcess = sortBy(copiedProcesses, x => x.ArrivalTime)[0];
        // processQueue.push(firstProcess);
        // this.removeProcessItemFromCollection(firstProcess, copiedProcesses);

        // let startTime = 0;
        // let endTime = 0;
        // let currentProcess: ProcessItem = firstProcess;
        // while (copiedProcesses.length !== 0)
        // {
        //     // At the moment when a new process comes but the current process runs out of time and not yet finishes
        //     // This new process will be enqueued before putting current process to the back of the queue
        //     let availableProcesses = this.filterAvailableProcesses(copiedProcesses, endTime);
        //     if (availableProcesses.length === 0)
        //     {
        //         let nextProcess = this.findProcessWithMinArrivalTime(copiedProcesses);
        //         startTime = endTime;
        //         endTime = nextProcess.ArrivalTime;
        //         timeBlocks.push(new ProcessTimeBlock('-', startTime, endTime));
        //         availableProcesses = this.filterAvailableProcesses(copiedProcesses, endTime);
        //     }

        //     currentProcess.BurstTime -= 1;
        //     endTime += 1;

        //     for (let process of availableProcesses) {
        //         processQueue.push(process);
        //         this.removeProcessItemFromCollection(process, copiedProcesses);
        //     }

        //     if (currentProcess.BurstTime === 0) {
        //         timeBlocks.push(new ProcessTimeBlock(currentProcess.Name, startTime, endTime));
        //         startTime = endTime;
        //         processQueue.shift();

        //         if (processQueue.length > 0) {
        //             currentProcess = processQueue[0];
        //         }
        //     } else {
        //         let duration = endTime - startTime;
        //         if (duration === quantum) {
        //             timeBlocks.push(new ProcessTimeBlock(currentProcess.Name, startTime, endTime));
        //             startTime = endTime;

                    

        //             // Move to the back of queue
        //             let outOfTimeProcess = processQueue.shift();
        //             processQueue.push(outOfTimeProcess);
        //             currentProcess = processQueue[0];
        //         }
        //     }
        // }

        return timeBlocks;
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

    private findProcessWithMinArrivalTime(processes: ProcessItem[]): ProcessItem {
        let minArrivalTime = min(processes.map(x => x.ArrivalTime));
        return processes.find(x => x.ArrivalTime === minArrivalTime);
    }
}