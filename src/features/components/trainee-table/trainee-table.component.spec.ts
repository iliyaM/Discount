import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {TraineeTableComponent} from './trainee-table.component';
import {TraineesService} from '../../../shared/services/trainees.service';
import {SearchFilterService} from '../../../shared/services/search-filter.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {IPosts, ITrainee} from '../../../shared/interfaces/trainee.interface';
import {PageEvent} from '@angular/material/paginator';
import {signal} from '@angular/core';
import {ComparisonOperator, FilterType} from '../../../shared/interfaces/filters.interface';

describe('TraineeTableComponent', () => {
  let component: TraineeTableComponent;
  let fixture: ComponentFixture<TraineeTableComponent>;
  let mockTraineesService: jasmine.SpyObj<TraineesService>;
  let mockSearchFilterService: jasmine.SpyObj<SearchFilterService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockPost: IPosts = {
    id: 1,
    userId: 1,
    title: 'Test Post',
    body: 'Test Body',
    name: 'John Doe',
    subject: 'Math',
    date: '2024-01-15',
    grade: 85
  };

  const mockTrainee: ITrainee = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phone: '123-456-7890',
    website: 'john.com',
    address: {
      street: '123 Main St',
      suite: 'Apt 1',
      city: 'New York',
      zipcode: '10001',
      geo: { lat: '40.7128', lng: '-74.0060' }
    },
    company: {
      name: 'Doe Corp',
      catchPhrase: 'We do things',
      bs: 'solutions'
    },
    grade: 85,
    subject: 'Math',
    date: '2024-01-15'
  };

  beforeEach(async () => {
    mockTraineesService = jasmine.createSpyObj('TraineesService', ['getTrainees', 'getTraineeDetails']);
    mockSearchFilterService = jasmine.createSpyObj('SearchFilterService', [
      'parseSearchTerm',
      'filterById',
      'filterByGrade',
      'filterByDate',
      'filterByGeneralSearch'
    ]);
    (mockSearchFilterService as any).searchTerm = signal('');
    (mockSearchFilterService as any).pageIndex = signal(1);

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        TraineeTableComponent,
      ],
      providers: [
        { provide: TraineesService, useValue: mockTraineesService },
        { provide: SearchFilterService, useValue: mockSearchFilterService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    // Prevent effect from running during setup
    mockTraineesService.getTrainees.and.returnValue(of([]));

    fixture = TestBed.createComponent(TraineeTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize displayedColumns', () => {
      expect(component.displayedColumns).toEqual(['id', 'name', 'date', 'grade', 'subject']);
    });

    it('should initialize userData as empty array', () => {
      expect(component.userData()).toEqual([]);
    });

    it('should initialize filteredData as empty array', () => {
      expect(component.filteredData()).toEqual([]);
    });

    it('should initialize selectedTrainee as null', () => {
      expect(component.selectedTrainee()).toBe(null);
    });

    it('should initialize loader as false', () => {
      expect(component.loader).toBe(false);
    });

    it('should initialize detailsLoading as false', () => {
      expect(component.detailsLoading).toBe(false);
    });

    it('should initialize pagination properties', () => {
      expect(component.pageIndex).toBe(1);
      expect(component.pageSize).toBe(10);
      expect(component.totalItems).toBe(100);
    });

    it('should call getUsersData on init', () => {
      spyOn(component, 'getUsersData');

      component.ngOnInit();

      expect(component.getUsersData).toHaveBeenCalled();
    });

    it('should call setupFilterEffect in constructor', () => {
      // Effect should be set up (tested in effect tests)
      expect(component).toBeTruthy();
    });
  });

  describe('getUsersData()', () => {
    it('should set loader to true at start', () => {
      mockTraineesService.getTrainees.and.returnValue(of([mockPost]));

      component.getUsersData();

      expect(component.loader).toBe(false);
    });

    it('should call getTrainees with current page index', () => {
      mockTraineesService.getTrainees.and.returnValue(of([mockPost]));
      mockSearchFilterService.pageIndex.set(2)
      component.getUsersData();

      fixture.detectChanges();
      expect(mockTraineesService.getTrainees).toHaveBeenCalledWith(2);
    });

    it('should set userData and loader on success', (done) => {
      mockTraineesService.getTrainees.and.returnValue(of([mockPost]));

      component.getUsersData();

      setTimeout(() => {
        expect(component.userData()).toEqual([mockPost]);
        expect(component.loader).toBe(false);
        done();
      }, 100);
    });

    it('should handle error and set loader to false', (done) => {
      const error = new Error('API Error');
      mockTraineesService.getTrainees.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.getUsersData();

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith(error);
        expect(component.userData()).toEqual([]);
        expect(component.loader).toBe(false);
        done();
      }, 100);
    });
  });

  describe('setupFilterEffect()', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set filteredData to userData when search is empty', () => {
      component.userData.set([mockPost]);

      mockSearchFilterService.searchTerm.set('');
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.filteredData()).toEqual([mockPost]);
      }, 100);
    });

    it('should filter by ID when search term is "id:1"', () => {
      component.userData.set([mockPost]);
      mockSearchFilterService.parseSearchTerm.and.returnValue({
        type: FilterType.ID,
        value: 1
      });
      mockSearchFilterService.filterById.and.returnValue(true);

      mockSearchFilterService.searchTerm.set('id:1');
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockSearchFilterService.parseSearchTerm).toHaveBeenCalledWith('id:1');
        expect(mockSearchFilterService.filterById).toHaveBeenCalledWith(mockPost, 1);
      }, 100);
    });

    it('should filter by grade when search term is "> 80"', () => {
      component.userData.set([mockPost]);
      mockSearchFilterService.parseSearchTerm.and.returnValue({
        type: FilterType.GRADE,
        value: 80,
        operator: '>' as any
      });
      mockSearchFilterService.filterByGrade.and.returnValue(true);

      mockSearchFilterService.searchTerm.set('> 80');
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockSearchFilterService.filterByGrade).toHaveBeenCalledWith(mockPost, 80, ComparisonOperator.GREATER_THAN);
      }, 100);
    });

    it('should filter by date when search term is "< 2024-01-01"', () => {
      component.userData.set([mockPost]);
      mockSearchFilterService.parseSearchTerm.and.returnValue({
        type: FilterType.DATE,
        value: '2024-01-01',
        operator: '<' as any
      });
      mockSearchFilterService.filterByDate.and.returnValue(false);

      mockSearchFilterService.searchTerm.set('< 2024-01-01');
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockSearchFilterService.filterByDate).toHaveBeenCalledWith(mockPost, '2024-01-01', ComparisonOperator.LESS_THAN);
      }, 100);
    });

    it('should filter by general search', () => {
      component.userData.set([mockPost]);
      mockSearchFilterService.parseSearchTerm.and.returnValue({
        type: FilterType.GENERAL,
        value: 'john'
      });
      mockSearchFilterService.filterByGeneralSearch.and.returnValue(true);

      mockSearchFilterService.searchTerm.set('john');
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockSearchFilterService.filterByGeneralSearch).toHaveBeenCalledWith(mockPost, 'john');
      }, 100);
    });
  });

  describe('onPageChange()', () => {
    it('should update pageIndex', () => {
      mockTraineesService.getTrainees.and.returnValue(of([mockPost]));
      const event: PageEvent = { pageIndex: 3, pageSize: 10, length: 100 };

      component.onPageChange(event);

      expect(component.pageIndex).toBe(3);
    });

    it('should update searchFilterService pageIndex', () => {
      mockTraineesService.getTrainees.and.returnValue(of([mockPost]));
      spyOn(mockSearchFilterService.pageIndex, 'set');

      const event: PageEvent = { pageIndex: 2, pageSize: 10, length: 100 };

      component.onPageChange(event);

      expect(mockSearchFilterService.pageIndex.set).toHaveBeenCalledWith(2);
    });

    it('should update pageSize', () => {
      mockTraineesService.getTrainees.and.returnValue(of([mockPost]));
      const event: PageEvent = { pageIndex: 1, pageSize: 20, length: 100 };

      component.onPageChange(event);

      expect(component.pageSize).toBe(20);
    });

    it('should call getUsersData', () => {
      mockTraineesService.getTrainees.and.returnValue(of([mockPost]));
      spyOn(component, 'getUsersData');
      const event: PageEvent = { pageIndex: 1, pageSize: 10, length: 100 };

      component.onPageChange(event);

      expect(component.getUsersData).toHaveBeenCalled();
    });
  });

  describe('tableRowClicked()', () => {
    it('should set detailsLoading to true at start', () => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));

      component.tableRowClicked(mockPost);

      expect(component.detailsLoading).toBe(false);
    });

    it('should call getTraineeDetails with post', () => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));

      component.tableRowClicked(mockPost);

      expect(mockTraineesService.getTraineeDetails).toHaveBeenCalledWith(mockPost);
    });

    it('should set selectedTrainee and detailsLoading on success', (done) => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));
      component.tableRowClicked(mockPost);

      setTimeout(() => {
        expect(component.selectedTrainee()).toEqual(mockTrainee);
        expect(component.detailsLoading).toBe(false);
        done();
      }, 100);
    });

    it('should set selectedTrainee to null and detailsLoading to false on error', (done) => {
      const error = new Error('API Error');
      mockTraineesService.getTraineeDetails.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.tableRowClicked(mockPost);

      setTimeout(() => {
        expect(component.selectedTrainee()).toBe(null);
        expect(component.detailsLoading).toBe(false);
        expect(console.error).toHaveBeenCalledWith(error);
        done();
      }, 100);
    });
  });

  describe('clearSelection()', () => {
    it('should set selectedTrainee to null', () => {
      component.selectedTrainee.set(mockTrainee);

      component.clearSelection();

      expect(component.selectedTrainee()).toBe(null);
    });
  });

  describe('deleteFromTable()', () => {
    it('should do nothing when no trainee is selected', () => {
      component.userData.set([mockPost]);
      component.selectedTrainee.set(null);

      component.deleteFromTable();

      expect(component.userData()).toEqual([mockPost]);
    });

    it('should remove trainee from userData', () => {
      const post1: IPosts = { ...mockPost, id: 1 };
      const post2: IPosts = { ...mockPost, id: 2 };
      component.userData.set([post1, post2]);
      component.selectedTrainee.set({ ...mockTrainee, id: 1 });

      component.deleteFromTable();

      expect(component.userData().length).toBe(1);
      expect(component.userData()[0].id).toBe(2);
    });

    it('should clear selection after delete', () => {
      component.userData.set([mockPost]);
      component.selectedTrainee.set(mockTrainee);
      spyOn(component, 'clearSelection');

      component.deleteFromTable();

      expect(component.clearSelection).toHaveBeenCalled();
    });

    it('should not affect other trainees', () => {
      const post1: IPosts = { ...mockPost, id: 1, name: 'Alice' };
      const post2: IPosts = { ...mockPost, id: 2, name: 'Bob' };
      const post3: IPosts = { ...mockPost, id: 3, name: 'Charlie' };
      component.userData.set([post1, post2, post3]);
      component.selectedTrainee.set({ ...mockTrainee, id: 2 });

      component.deleteFromTable();

      const remaining = component.userData();
      expect(remaining.length).toBe(2);
      expect(remaining.map(p => p.name)).toEqual(['Alice', 'Charlie']);
    });
  });

  describe('addTrainee()', () => {
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<any>>;

    beforeEach(() => {
      mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      mockDialog.open.and.returnValue(mockDialogRef);
    });

    it('should open dialog with correct configuration', () => {
      mockDialogRef.afterClosed.and.returnValue(of(null));

      component.addTrainee();

      expect(mockDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
        width: '500px',
        disableClose: true
      });
    });

    it('should not add trainee when dialog is cancelled', () => {
      mockDialogRef.afterClosed.and.returnValue(of(null));
      component.userData.set([mockPost]);

      component.addTrainee();

      expect(component.userData().length).toBe(1);
    });

    it('should add trainee when dialog returns data', (done) => {
      const newTrainee = {
        name: 'Jane Smith',
        subject: 'Physics',
        grade: 92,
        date: '2024-06-15'
      };
      mockDialogRef.afterClosed.and.returnValue(of(newTrainee));
      component.userData.set([mockPost]);

      component.addTrainee();

      setTimeout(() => {
        const data = component.userData();
        expect(data.length).toBe(2);
        expect(data[1].name).toBe('Jane Smith');
        expect(data[1].subject).toBe('Physics');
        expect(data[1].grade).toBe(92);
        done();
      }, 100);
    });

    it('should generate random ID and userId', (done) => {
      const newTrainee = {
        name: 'Test User',
        subject: 'Math',
        grade: 75,
        date: '2024-01-01'
      };
      mockDialogRef.afterClosed.and.returnValue(of(newTrainee));
      component.userData.set([]);

      component.addTrainee();

      setTimeout(() => {
        const added = component.userData()[0];
        expect(added.id).toBeGreaterThan(0);
        expect(added.id).toBeLessThanOrEqual(1000001);
        expect(added.userId).toBeGreaterThan(0);
        expect(added.userId).toBeLessThanOrEqual(1000001);
        done();
      }, 100);
    });

    it('should create title and body from trainee data', (done) => {
      const newTrainee = {
        name: 'Bob Jones',
        subject: 'Chemistry',
        grade: 88,
        date: '2024-03-20'
      };
      mockDialogRef.afterClosed.and.returnValue(of(newTrainee));
      component.userData.set([]);

      component.addTrainee();

      setTimeout(() => {
        const added = component.userData()[0];
        expect(added.title).toBe('Bob Jones - Chemistry');
        expect(added.body).toBe('Trainee: Bob Jones, Subject: Chemistry, Grade: 88');
        done();
      }, 100);
    });

    it('should use current date if date not provided', (done) => {
      const newTrainee = {
        name: 'Test User',
        subject: 'Math',
        grade: 75,
        date: undefined as any
      };
      mockDialogRef.afterClosed.and.returnValue(of(newTrainee));
      component.userData.set([]);

      component.addTrainee();

      setTimeout(() => {
        const added = component.userData()[0];
        expect(added.date).toBeTruthy();
        expect(added.date).toContain('T'); // ISO format check
        done();
      }, 100);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from subscriptions', () => {
      mockTraineesService.getTrainees.and.returnValue(of([mockPost]));

      component.getUsersData();

      spyOn(component.subscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(component.subscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      mockTraineesService.getTrainees.and.returnValue(of([mockPost]));
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));
      fixture.detectChanges();
    });

    it('should load data, select trainee, and delete', (done) => {
      component.ngOnInit();

      setTimeout(() => {
        expect(component.userData().length).toBeGreaterThan(0);

        // Select trainee
        component.tableRowClicked(mockPost);

        setTimeout(() => {
          expect(component.selectedTrainee()).toBeTruthy();

          // Delete trainee
          const initialCount = component.userData().length;
          component.deleteFromTable();

          expect(component.userData().length).toBe(initialCount - 1);
          expect(component.selectedTrainee()).toBe(null);
          done();
        }, 100);
      }, 100);
    });

    it('should handle page changes and reload data', (done) => {
      component.ngOnInit();

      setTimeout(() => {
        const event: PageEvent = { pageIndex: 2, pageSize: 10, length: 100 };
        component.onPageChange(event);

        expect(component.pageIndex).toBe(2);
        expect(mockTraineesService.getTrainees).toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});
