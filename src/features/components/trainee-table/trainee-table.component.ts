import {Component, computed, effect, OnDestroy, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {IPosts, ITrainee} from '../../../shared/interfaces/trainee.interface';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SearchFilterService} from '../../../shared/services/search-filter.service';
import {TraineesService} from '../../../shared/services/trainees.service';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {FormsModule} from '@angular/forms';
import {CommonModule, DatePipe} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {FilterType, ParsedFilter} from '../../../shared/interfaces/filters.interface';
import {Subscription} from 'rxjs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {AddTraineeModalComponent} from '../../../shared/add-trainee-modal/add-trainee-modal.component';

@Component({
  selector: 'app-trainee-table',
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    FormsModule,
    MatDivider,
    DatePipe,
    MatIcon,
    MatCardModule,
    MatButton,
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './trainee-table.component.html',
  styleUrl: './trainee-table.component.scss'
})
export class TraineeTableComponent implements OnInit, OnDestroy {
  displayedColumns = ['id', 'name', 'date', 'grade', 'subject'];
  userData: WritableSignal<IPosts[]> = signal<IPosts[]>([]);
  filteredData: WritableSignal<IPosts[]> = signal([]);
  selectedTrainee: WritableSignal<ITrainee | null> = signal<ITrainee | null>(null);
  subscription: Subscription = new Subscription();
  loader: boolean = false;
  detailsLoading: boolean = false;

  pageIndex: number = 1;
  pageSize = 10;
  totalItems = 100;

  constructor(
    private traineesService: TraineesService,
    public searchFilterService: SearchFilterService,
    private dialog: MatDialog) {
    this.setupFilterEffect();
  }

  ngOnInit() {
    this.getUsersData();
  }

  getUsersData() {
    this.loader = true;
    this.subscription.add(this.traineesService.getTrainees(this.searchFilterService.pageIndex()).subscribe({
      next: (data: IPosts[]) => {
        this.loader = false;
        this.userData.set(data);
      },
      error: error => {
        this.loader = false;
        console.error(error);
        this.userData.set([]);
      }
    }));
  }

  setupFilterEffect() {
    effect(() => {
      const searchTerm: string = this.searchFilterService.searchTerm().toLowerCase().trim();

      if (!searchTerm) {
        this.filteredData.set(this.userData());
        return;
      }

      const filter: ParsedFilter = this.searchFilterService.parseSearchTerm(searchTerm);

      const filtered: IPosts[] = this.userData().filter((trainee: IPosts) => {
        switch (filter.type) {
          case FilterType.ID:
            return this.searchFilterService.filterById(trainee, filter.value as number);

          case FilterType.GRADE:
            return this.searchFilterService.filterByGrade(trainee, filter.value as number, filter.operator!);

          case FilterType.DATE:
            return this.searchFilterService.filterByDate(trainee, filter.value as string, filter.operator!);

          case FilterType.GENERAL:
            return this.searchFilterService.filterByGeneralSearch(trainee, filter.value as string);

          default:
            return true;
        }
      });

      this.filteredData.set(filtered);
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex
    this.searchFilterService.pageIndex.set(event.pageIndex)
    this.pageSize = event.pageSize;
    this.getUsersData();
  }

  tableRowClicked(post: IPosts) {
    this.detailsLoading = true;
    this.subscription.add(this.traineesService.getTraineeDetails(post).subscribe({
      next: (traineeDetails: ITrainee) => {
        this.detailsLoading = false;
        console.log(traineeDetails)
        this.selectedTrainee.set(traineeDetails)
      },
      error: error => {
        this.detailsLoading = false;
        console.error(error);
        this.selectedTrainee.set(null)
      }
    }))
  }

  clearSelection() {
    this.selectedTrainee.set(null);
  }

  deleteFromTable() {
    const trainee: ITrainee | null  = this.selectedTrainee();
    if(!trainee) {
      return;
    }

    this.userData.update((currentData: IPosts[]) =>
      currentData.filter((item: IPosts) => item.id !== trainee.id)
    );
    this.clearSelection();
  }

  addTrainee() {
    const dialogRef = this.dialog.open(AddTraineeModalComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: ITrainee) => {
      if (result) {
        const newPost: IPosts = {
          id: Math.floor(Math.random() * 1000000) + 1,
          userId: Math.floor(Math.random() * 1000000) + 1,
          title: `${result.name} - ${result.subject}`,
          body: `Trainee: ${result.name}, Subject: ${result.subject}, Grade: ${result.grade}`,
          name: result.name,
          grade: result.grade,
          subject: result.subject,
          date: result.date || new Date().toISOString()
        };

        this.userData.update((currentData: IPosts[]) => [...currentData, newPost]);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
