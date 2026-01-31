import {Component, OnDestroy, signal, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatChipsModule} from '@angular/material/chips';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList} from '@angular/cdk/drag-drop';
import {Subscription} from 'rxjs';
import {TraineesService} from '../../../shared/services/trainees.service';
import {ITrainee, IPosts, TraineeSlot} from '../../../shared/interfaces/trainee.interface';
import {MatButton, MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-analysis',
  imports: [
    CommonModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CdkDrag,
    CdkDropList,
    MatButton,
    MatIconButton
  ],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss'
})
export class AnalysisComponent implements OnDestroy {
  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  containers: WritableSignal<(TraineeSlot | null)[]> = signal([null, null, null]);
  showThirdContainer = signal(false);

  private subscription = new Subscription();

  constructor(private traineesService: TraineesService) {}

  get selectedNumbers(): number[] {
    return this.containers()
      .filter(container => container !== null)
      .map(container => container!.id);
  }

  get totalSelected(): number {
    return this.selectedNumbers.length;
  }

  get visibleContainers(): (TraineeSlot | null)[] {
    return this.showThirdContainer()
      ? this.containers()
      : this.containers().slice(0, 2);
  }

  isNumberSelected(num: number): boolean {
    return this.selectedNumbers.includes(num);
  }

  getConnectedLists(): string[] {
    const lists = ['numberList', 'container0', 'container1'];
    if (this.showThirdContainer()) {
      lists.push('container2');
    }
    return lists;
  }

  drop(event: CdkDragDrop<TraineeSlot | null>, containerIndex: number) {
    const draggedNumber = event.item.data as number;

    if (event.previousContainer === event.container) {
      return;
    }

    if (event.previousContainer.id === 'numberList') {
      this.addToContainer(draggedNumber, containerIndex);
    } else {
      const fromIndex = parseInt(event.previousContainer.id.replace('container', ''));
      this.swapContainers(fromIndex, containerIndex);
    }
  }

  addToContainer(num: number, containerIndex: number) {
    const newSlot: TraineeSlot = {
      id: num,
      data: null,
      loading: true
    };

    this.updateContainer(containerIndex, newSlot);

    const mockPost: IPosts = {
      id: num,
      userId: num,
      title: `Trainee ${num}`,
      body: `Details for trainee ${num}`,
      name: `Trainee ${num}`,
      subject: 'Mathematics',
      date: new Date().toISOString(),
      grade: Math.floor(Math.random() * 100) + 1
    };

    this.subscription.add(
      this.traineesService.getTraineeDetails(mockPost).subscribe({
        next: (trainee: ITrainee) => {
          const slot = this.containers()[containerIndex];
          if (slot && slot.id === num) {
            this.updateContainer(containerIndex, { ...slot, data: trainee, loading: false });
          }
        },
        error: (error) => {
          console.error('Error fetching trainee:', error);
          const slot = this.containers()[containerIndex];
          if (slot && slot.id === num) {
            this.updateContainer(containerIndex, { ...slot, loading: false });
          }
        }
      })
    );
  }

  swapContainers(fromIndex: number, toIndex: number) {
    this.containers.update(current => {
      const newContainers = [...current];
      const temp = newContainers[fromIndex];
      newContainers[fromIndex] = newContainers[toIndex];
      newContainers[toIndex] = temp;
      return newContainers;
    });
  }

  removeFromContainer(containerIndex: number) {
    this.updateContainer(containerIndex, null);
  }

  private updateContainer(index: number, slot: TraineeSlot | null) {
    this.containers.update(current => {
      const newContainers = [...current];
      newContainers[index] = slot;
      return newContainers;
    });
  }

  toggleThirdContainer() {
    this.showThirdContainer.update(value => !value);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
