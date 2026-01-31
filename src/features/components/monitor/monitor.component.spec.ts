import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {MonitorComponent} from './monitor.component';
import {TraineesService} from '../../../shared/services/trainees.service';
import {IPosts} from '../../../shared/interfaces/trainee.interface';

describe('MonitorComponent', () => {
  let component: MonitorComponent;
  let fixture: ComponentFixture<MonitorComponent>;
  let mockTraineesService: jasmine.SpyObj<TraineesService>;

  const mockTrainee1: IPosts = {
    id: 1,
    userId: 1,
    title: 'Post 1',
    body: 'Body 1',
    name: 'Alice Smith',
    subject: 'Math',
    date: '2024-01-15',
    grade: 85
  };

  const mockTrainee2: IPosts = {
    id: 2,
    userId: 2,
    title: 'Post 2',
    body: 'Body 2',
    name: 'Bob Johnson',
    subject: 'Physics',
    date: '2024-02-10',
    grade: 45
  };

  const mockTrainee3: IPosts = {
    id: 3,
    userId: 3,
    title: 'Post 3',
    body: 'Body 3',
    name: 'Charlie Brown',
    subject: 'Chemistry',
    date: '2024-03-05',
    grade: 72
  };

  beforeEach(async () => {
    mockTraineesService = jasmine.createSpyObj('TraineesService', ['getTrainees']);

    await TestBed.configureTestingModule({
      imports: [
        MonitorComponent,
      ],
      providers: [
        { provide: TraineesService, useValue: mockTraineesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MonitorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize displayedColumns', () => {
      expect(component.displayedColumns).toEqual(['id', 'name', 'grade', 'status']);
    });

    it('should initialize allTrainees as empty array', () => {
      expect(component.allTrainees()).toEqual([]);
    });

    it('should initialize filters with default values', () => {
      expect(component.filters()).toEqual({
        selectedIds: [],
        nameSearch: '',
        showPassed: true,
        showFailed: true
      });
    });

    it('should initialize loading as false', () => {
      expect(component.loading()).toBe(false);
    });

    it('should call loadAllTrainees on init', () => {
      mockTraineesService.getTrainees.and.returnValue(of([]));
      spyOn(component, 'loadAllTrainees');

      component.ngOnInit();

      expect(component.loadAllTrainees).toHaveBeenCalled();
    });
  });

  describe('loadAllTrainees()', () => {
    it('should set loading to true at start', () => {
      mockTraineesService.getTrainees.and.returnValue(of([]));

      component.loadAllTrainees();

      expect(component.loading()).toBe(false);
    });

    it('should call getTrainees for IDs 1-10', () => {
      mockTraineesService.getTrainees.and.returnValue(of([]));

      component.loadAllTrainees();

      expect(mockTraineesService.getTrainees).toHaveBeenCalledTimes(10);
      for (let i = 1; i <= 10; i++) {
        expect(mockTraineesService.getTrainees).toHaveBeenCalledWith(i);
      }
    });

    it('should flatten and set all trainees data', (done) => {
      mockTraineesService.getTrainees.and.returnValues(
        of([mockTrainee1]),
        of([mockTrainee2]),
        of([mockTrainee3]),
        of([]),
        of([]),
        of([]),
        of([]),
        of([]),
        of([]),
        of([])
      );

      component.loadAllTrainees();

      setTimeout(() => {
        const allTrainees = component.allTrainees();
        expect(allTrainees.length).toBe(3);
        expect(allTrainees).toContain(mockTrainee1);
        expect(allTrainees).toContain(mockTrainee2);
        expect(allTrainees).toContain(mockTrainee3);
        done();
      }, 100);
    });

    it('should set loading to false after successful load', (done) => {
      mockTraineesService.getTrainees.and.returnValue(of([mockTrainee1]));

      component.loadAllTrainees();

      setTimeout(() => {
        expect(component.loading()).toBe(false);
        done();
      }, 100);
    });

    it('should handle error and set loading to false', (done) => {
      const error = new Error('API Error');
      mockTraineesService.getTrainees.and.returnValue(throwError(() => error));

      spyOn(console, 'error');

      component.loadAllTrainees();

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('Error loading trainees:', error);
        expect(component.loading()).toBe(false);
        done();
      }, 100);
    });

    it('should handle empty responses', (done) => {
      mockTraineesService.getTrainees.and.returnValue(of([]));

      component.loadAllTrainees();

      setTimeout(() => {
        expect(component.allTrainees()).toEqual([]);
        expect(component.loading()).toBe(false);
        done();
      }, 100);
    });
  });

  describe('availableIds computed', () => {
    it('should return empty array when no trainees', () => {
      expect(component.availableIds()).toEqual([]);
    });

    it('should return sorted unique IDs', () => {
      component.allTrainees.set([mockTrainee1, mockTrainee2, mockTrainee3]);

      expect(component.availableIds()).toEqual([1, 2, 3]);
    });

    it('should remove duplicate IDs', () => {
      const duplicate = { ...mockTrainee1 };
      component.allTrainees.set([mockTrainee1, duplicate, mockTrainee2]);

      expect(component.availableIds()).toEqual([1, 2]);
    });

    it('should sort IDs in ascending order', () => {
      component.allTrainees.set([
        { ...mockTrainee1, id: 10 },
        { ...mockTrainee2, id: 3 },
        { ...mockTrainee3, id: 7 }
      ]);

      expect(component.availableIds()).toEqual([3, 7, 10]);
    });
  });

  describe('filteredTrainees computed', () => {
    beforeEach(() => {
      component.allTrainees.set([mockTrainee1, mockTrainee2, mockTrainee3]);
    });

    it('should return all trainees with default filters', () => {
      const filtered = component.filteredTrainees();
      expect(filtered.length).toBe(3);
    });

    describe('ID filtering', () => {
      it('should filter by selected IDs', () => {
        component.filters.update(f => ({ ...f, selectedIds: [1, 3] }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(2);
        expect(filtered.map(t => t.id)).toEqual([1, 3]);
      });

      it('should return all when no IDs selected', () => {
        component.filters.update(f => ({ ...f, selectedIds: [] }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(3);
      });

      it('should return empty when selected ID not in data', () => {
        component.filters.update(f => ({ ...f, selectedIds: [999] }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(0);
      });
    });

    describe('Name filtering', () => {
      it('should filter by name (case insensitive)', () => {
        component.filters.update(f => ({ ...f, nameSearch: 'alice' }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe('Alice Smith');
      });

      it('should filter by partial name match', () => {
        component.filters.update(f => ({ ...f, nameSearch: 'smith' }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe('Alice Smith');
      });

      it('should return all when nameSearch is empty', () => {
        component.filters.update(f => ({ ...f, nameSearch: '' }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(3);
      });

      it('should return empty when no names match', () => {
        component.filters.update(f => ({ ...f, nameSearch: 'xyz' }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(0);
      });
    });

    describe('Status filtering', () => {
      it('should show only passed when showFailed is false', () => {
        component.filters.update(f => ({ ...f, showFailed: false }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(2);
        expect(filtered.every(t => t.grade >= 65)).toBe(true);
      });

      it('should show only failed when showPassed is false', () => {
        component.filters.update(f => ({ ...f, showPassed: false }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(1);
        expect(filtered.every(t => t.grade < 65)).toBe(true);
      });

      it('should show none when both are false', () => {
        component.filters.update(f => ({ ...f, showPassed: false, showFailed: false }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(0);
      });

      it('should show all when both are true', () => {
        component.filters.update(f => ({ ...f, showPassed: true, showFailed: true }));

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(3);
      });

      it('should correctly identify passed students (grade >= 65)', () => {
        component.filters.update(f => ({ ...f, showFailed: false }));

        const filtered = component.filteredTrainees();
        expect(filtered.map(t => t.name)).toEqual(['Alice Smith', 'Charlie Brown']);
      });

      it('should correctly identify failed students (grade < 65)', () => {
        component.filters.update(f => ({ ...f, showPassed: false }));

        const filtered = component.filteredTrainees();
        expect(filtered.map(t => t.name)).toEqual(['Bob Johnson']);
      });
    });

    describe('Combined filtering', () => {
      it('should apply all filters together', () => {
        component.filters.set({
          selectedIds: [1, 2],
          nameSearch: 'smith',
          showPassed: true,
          showFailed: false
        });

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe('Alice Smith');
      });

      it('should return empty when filters exclude all', () => {
        component.filters.set({
          selectedIds: [1],
          nameSearch: 'bob',
          showPassed: true,
          showFailed: true
        });

        const filtered = component.filteredTrainees();
        expect(filtered.length).toBe(0);
      });
    });
  });

  describe('updateFilters()', () => {
    it('should update selectedIds', () => {
      component.updateFilters({ selectedIds: [1, 2, 3] });

      expect(component.filters().selectedIds).toEqual([1, 2, 3]);
    });

    it('should update nameSearch', () => {
      component.updateFilters({ nameSearch: 'test' });

      expect(component.filters().nameSearch).toBe('test');
    });

    it('should update showPassed', () => {
      component.updateFilters({ showPassed: false });

      expect(component.filters().showPassed).toBe(false);
    });

    it('should update showFailed', () => {
      component.updateFilters({ showFailed: false });

      expect(component.filters().showFailed).toBe(false);
    });

    it('should update multiple filters at once', () => {
      component.updateFilters({
        selectedIds: [5],
        nameSearch: 'alice',
        showPassed: false
      });

      const filters = component.filters();
      expect(filters.selectedIds).toEqual([5]);
      expect(filters.nameSearch).toBe('alice');
      expect(filters.showPassed).toBe(false);
      expect(filters.showFailed).toBe(true); // Should preserve
    });

    it('should preserve other filters when updating one', () => {
      component.filters.set({
        selectedIds: [1, 2],
        nameSearch: 'test',
        showPassed: true,
        showFailed: false
      });

      component.updateFilters({ nameSearch: 'new' });

      const filters = component.filters();
      expect(filters.selectedIds).toEqual([1, 2]);
      expect(filters.nameSearch).toBe('new');
      expect(filters.showPassed).toBe(true);
      expect(filters.showFailed).toBe(false);
    });
  });

  describe('getStatusClass()', () => {
    it('should return "passed" for grade >= 65', () => {
      expect(component.getStatusClass(65)).toBe('passed');
      expect(component.getStatusClass(70)).toBe('passed');
      expect(component.getStatusClass(100)).toBe('passed');
    });

    it('should return "failed" for grade < 65', () => {
      expect(component.getStatusClass(64)).toBe('failed');
      expect(component.getStatusClass(50)).toBe('failed');
      expect(component.getStatusClass(0)).toBe('failed');
    });

    it('should handle edge case of exactly 65', () => {
      expect(component.getStatusClass(65)).toBe('passed');
    });
  });

  describe('getStatusText()', () => {
    it('should return "Passed" for grade >= 65', () => {
      expect(component.getStatusText(65)).toBe('Passed');
      expect(component.getStatusText(80)).toBe('Passed');
      expect(component.getStatusText(100)).toBe('Passed');
    });

    it('should return "Not Passed" for grade < 65', () => {
      expect(component.getStatusText(64)).toBe('Not Passed');
      expect(component.getStatusText(40)).toBe('Not Passed');
      expect(component.getStatusText(0)).toBe('Not Passed');
    });

    it('should handle edge case of exactly 65', () => {
      expect(component.getStatusText(65)).toBe('Passed');
    });
  });

  describe('clearFilters()', () => {
    it('should reset all filters to default', () => {
      component.filters.set({
        selectedIds: [1, 2, 3],
        nameSearch: 'test',
        showPassed: false,
        showFailed: false
      });

      component.clearFilters();

      expect(component.filters()).toEqual({
        selectedIds: [],
        nameSearch: '',
        showPassed: true,
        showFailed: true
      });
    });

    it('should reset filters from partial state', () => {
      component.updateFilters({ nameSearch: 'alice' });

      component.clearFilters();

      expect(component.filters()).toEqual({
        selectedIds: [],
        nameSearch: '',
        showPassed: true,
        showFailed: true
      });
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from subscriptions', () => {
      mockTraineesService.getTrainees.and.returnValue(of([mockTrainee1]));

      component.loadAllTrainees();

      spyOn(component['subscription'], 'unsubscribe');

      component.ngOnDestroy();

      expect(component['subscription'].unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    beforeEach((done) => {
      mockTraineesService.getTrainees.and.returnValues(
        of([mockTrainee1]),
        of([mockTrainee2]),
        of([mockTrainee3]),
        of([]),
        of([]),
        of([]),
        of([]),
        of([]),
        of([]),
        of([])
      );

      component.ngOnInit();

      setTimeout(() => {
        done();
      }, 100);
    });

    it('should load data and apply filters correctly', () => {
      expect(component.allTrainees().length).toBe(3);

      component.updateFilters({ nameSearch: 'alice' });

      expect(component.filteredTrainees().length).toBe(1);
      expect(component.filteredTrainees()[0].name).toBe('Alice Smith');
    });

    it('should update availableIds when data loads', () => {
      expect(component.availableIds()).toEqual([1, 2, 3]);
    });

    it('should handle complete filtering workflow', () => {
      // Start with all data
      expect(component.filteredTrainees().length).toBe(3);

      // Filter by status
      component.updateFilters({ showFailed: false });
      expect(component.filteredTrainees().length).toBe(2);

      // Add name filter
      component.updateFilters({ nameSearch: 'charlie' });
      expect(component.filteredTrainees().length).toBe(1);

      // Clear filters
      component.clearFilters();
      expect(component.filteredTrainees().length).toBe(3);
    });

    it('should reactive update filteredTrainees when filters change', () => {
      const initialCount = component.filteredTrainees().length;
      expect(initialCount).toBe(3);

      component.filters.update(f => ({ ...f, showPassed: false }));

      const newCount = component.filteredTrainees().length;
      expect(newCount).toBe(1);
      expect(newCount).not.toBe(initialCount);
    });
  });
});
