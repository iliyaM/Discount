import {Component, OnInit, OnDestroy, signal, computed, effect, WritableSignal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {forkJoin, Observable, Subscription} from 'rxjs';
import {TraineesService} from '../../../shared/services/trainees.service';
import {IPosts} from '../../../shared/interfaces/trainee.interface';
import {MonitorFilters} from '../../../shared/interfaces/filters.interface';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButton
  ],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.scss'
})
export class MonitorComponent implements OnInit, OnDestroy {
  displayedColumns = ['id', 'name', 'grade', 'status'];

  allTrainees: WritableSignal<IPosts[]> = signal<IPosts[]>([]);
  filters: WritableSignal<MonitorFilters> = signal<MonitorFilters>({
    selectedIds: [],
    nameSearch: '',
    showPassed: true,
    showFailed: true
  });

  availableIds = computed(() => {
    return [...new Set(this.allTrainees().map(t => t.id))].sort((a, b) => a - b);
  });

  filteredTrainees = computed(() => {
    const trainees = this.allTrainees();
    const currentFilters = this.filters();

    return trainees.filter(trainee => {
      // Filter by ID
      if (currentFilters.selectedIds.length > 0 && !currentFilters.selectedIds.includes(trainee.id)) {
        return false;
      }

      // Filter by name
      if (currentFilters.nameSearch && !trainee.name.toLowerCase().includes(currentFilters.nameSearch.toLowerCase())) {
        return false;
      }

      // Filter by status
      const isPassed = trainee.grade >= 65;
      if (!currentFilters.showPassed && isPassed) {
        return false;
      }
      return !(!currentFilters.showFailed && !isPassed);

    });
  });

  loading = signal(false);
  private subscription = new Subscription();

  constructor(private traineesService: TraineesService) {
  }

  ngOnInit() {
    this.loadAllTrainees();
  }

  loadAllTrainees() {
    this.loading.set(true);

    const arrayOfAvailableIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const requests: Observable<IPosts[]>[] = arrayOfAvailableIds.map(id => this.traineesService.getTrainees(id));

    this.subscription.add(forkJoin(requests).subscribe({
        next: (allPages: IPosts[][]) => {
          const allData = allPages.flat();

          this.allTrainees.set(allData);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading trainees:', error);
          this.loading.set(false);
        }
      })
    );
  }

  updateFilters(updates: Partial<MonitorFilters>) {
    this.filters.update(current => ({...current, ...updates}));
  }

  getStatusClass(grade: number): string {
    return grade >= 65 ? 'passed' : 'failed';
  }

  getStatusText(grade: number): string {
    return grade >= 65 ? 'Passed' : 'Not Passed';
  }

  clearFilters() {
    this.filters.set({
      selectedIds: [],
      nameSearch: '',
      showPassed: true,
      showFailed: true
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
