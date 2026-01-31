import {ComponentFixture, TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {AnalysisComponent} from './analysis.component';
import {TraineesService} from '../../../shared/services/trainees.service';
import {ITrainee, TraineeSlot} from '../../../shared/interfaces/trainee.interface';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

describe('AnalysisComponent', () => {
  let component: AnalysisComponent;
  let fixture: ComponentFixture<AnalysisComponent>;
  let mockTraineesService: jasmine.SpyObj<TraineesService>;

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
    date: '2024-01-01'
  };

  beforeEach(async () => {
    // Create mock service
    mockTraineesService = jasmine.createSpyObj('TraineesService', ['getTraineeDetails']);

    await TestBed.configureTestingModule({
      imports: [
        AnalysisComponent,
      ],
      providers: [
        { provide: TraineesService, useValue: mockTraineesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize numbers array from 1 to 10', () => {
      expect(component.numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should initialize containers with 3 null values', () => {
      expect(component.containers()).toEqual([null, null, null]);
    });

    it('should initialize showThirdContainer as false', () => {
      expect(component.showThirdContainer()).toBe(false);
    });
  });

  describe('selectedNumbers getter', () => {
    it('should return empty array when no containers are filled', () => {
      expect(component.selectedNumbers).toEqual([]);
    });

    it('should return IDs of filled containers', () => {
      component.containers.set([
        { id: 1, data: null, loading: false },
        { id: 5, data: null, loading: false },
        null
      ]);

      expect(component.selectedNumbers).toEqual([1, 5]);
    });

    it('should return all IDs when all containers are filled', () => {
      component.containers.set([
        { id: 2, data: null, loading: false },
        { id: 7, data: null, loading: false },
        { id: 9, data: null, loading: false }
      ]);

      expect(component.selectedNumbers).toEqual([2, 7, 9]);
    });
  });

  describe('totalSelected getter', () => {
    it('should return 0 when no containers are filled', () => {
      expect(component.totalSelected).toBe(0);
    });

    it('should return correct count of filled containers', () => {
      component.containers.set([
        { id: 1, data: null, loading: false },
        { id: 3, data: null, loading: false },
        null
      ]);

      expect(component.totalSelected).toBe(2);
    });

    it('should return 3 when all containers are filled', () => {
      component.containers.set([
        { id: 1, data: null, loading: false },
        { id: 2, data: null, loading: false },
        { id: 3, data: null, loading: false }
      ]);

      expect(component.totalSelected).toBe(3);
    });
  });

  describe('visibleContainers getter', () => {
    it('should return only first 2 containers when third is hidden', () => {
      component.containers.set([
        { id: 1, data: null, loading: false },
        { id: 2, data: null, loading: false },
        { id: 3, data: null, loading: false }
      ]);
      component.showThirdContainer.set(false);

      const visible = component.visibleContainers;
      expect(visible.length).toBe(2);
      expect(visible[0]?.id).toBe(1);
      expect(visible[1]?.id).toBe(2);
    });

    it('should return all 3 containers when third is visible', () => {
      component.containers.set([
        { id: 1, data: null, loading: false },
        { id: 2, data: null, loading: false },
        { id: 3, data: null, loading: false }
      ]);
      component.showThirdContainer.set(true);

      const visible = component.visibleContainers;
      expect(visible.length).toBe(3);
    });
  });

  describe('isNumberSelected()', () => {
    beforeEach(() => {
      component.containers.set([
        { id: 1, data: null, loading: false },
        { id: 5, data: null, loading: false },
        null
      ]);
    });

    it('should return true for selected number', () => {
      expect(component.isNumberSelected(1)).toBe(true);
      expect(component.isNumberSelected(5)).toBe(true);
    });

    it('should return false for unselected number', () => {
      expect(component.isNumberSelected(3)).toBe(false);
      expect(component.isNumberSelected(10)).toBe(false);
    });
  });

  describe('getConnectedLists()', () => {
    it('should return 3 lists when third container is hidden', () => {
      component.showThirdContainer.set(false);

      const lists = component.getConnectedLists();
      expect(lists).toEqual(['numberList', 'container0', 'container1']);
    });

    it('should return 4 lists when third container is visible', () => {
      component.showThirdContainer.set(true);

      const lists = component.getConnectedLists();
      expect(lists).toEqual(['numberList', 'container0', 'container1', 'container2']);
    });
  });

  describe('addToContainer()', () => {
    it('should add trainee slot to container with loading state', () => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));

      component.addToContainer(5, 0);

      const container = component.containers()[0];
      expect(container).toBeTruthy();
      expect(container?.id).toEqual(5);
      expect(container?.loading).toEqual(false);
      expect(container?.data).toEqual(mockTrainee);
    });

    it('should call service with correct mock post data', () => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));

      component.addToContainer(3, 1);

      expect(mockTraineesService.getTraineeDetails).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 3,
          userId: 3,
          title: 'Trainee 3',
          body: 'Details for trainee 3',
          name: 'Trainee 3',
          subject: 'Mathematics'
        })
      );
    });

    it('should update container with trainee data on success', (done) => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));

      component.addToContainer(1, 0);

      setTimeout(() => {
        const container = component.containers()[0];
        expect(container?.loading).toBe(false);
        expect(container?.data).toEqual(mockTrainee);
        done();
      }, 100);
    });

    it('should set loading to false on error', (done) => {
      const error = new Error('API Error');
      mockTraineesService.getTraineeDetails.and.returnValue(throwError(() => error));

      spyOn(console, 'error');

      component.addToContainer(1, 0);

      setTimeout(() => {
        const container = component.containers()[0];
        expect(container?.loading).toBe(false);
        expect(container?.data).toBe(null);
        expect(console.error).toHaveBeenCalledWith('Error fetching trainee:', error);
        done();
      }, 100);
    });

    it('should not update if slot ID changed before response', (done) => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee).pipe());

      component.addToContainer(1, 0);

      // Change the container before response arrives
      component.containers.update(current => {
        const newContainers = [...current];
        newContainers[0] = { id: 2, data: null, loading: true };
        return newContainers;
      });

      setTimeout(() => {
        const container = component.containers()[0];
        expect(container?.id).toBe(2);
        expect(container?.data).toBe(null);
        done();
      }, 100);
    });
  });

  describe('swapContainers()', () => {
    beforeEach(() => {
      component.containers.set([
        { id: 1, data: mockTrainee, loading: false },
        { id: 2, data: null, loading: false },
        { id: 3, data: null, loading: true }
      ]);
    });

    it('should swap containers at given indices', () => {
      component.swapContainers(0, 1);

      const containers = component.containers();
      expect(containers[0]?.id).toBe(2);
      expect(containers[1]?.id).toBe(1);
      expect(containers[2]?.id).toBe(3);
    });

    it('should swap first and third containers', () => {
      component.swapContainers(0, 2);

      const containers = component.containers();
      expect(containers[0]?.id).toBe(3);
      expect(containers[1]?.id).toBe(2);
      expect(containers[2]?.id).toBe(1);
    });

    it('should preserve container data when swapping', () => {
      component.swapContainers(0, 1);

      const containers = component.containers();
      expect(containers[1]?.data).toEqual(mockTrainee);
      expect(containers[0]?.data).toBe(null);
    });
  });

  describe('removeFromContainer()', () => {
    beforeEach(() => {
      component.containers.set([
        { id: 1, data: mockTrainee, loading: false },
        { id: 2, data: null, loading: false },
        null
      ]);
    });

    it('should set container to null', () => {
      component.removeFromContainer(0);

      expect(component.containers()[0]).toBe(null);
    });

    it('should not affect other containers', () => {
      component.removeFromContainer(0);

      const containers = component.containers();
      expect(containers[1]?.id).toBe(2);
      expect(containers[2]).toBe(null);
    });
  });

  describe('updateContainer()', () => {
    it('should update container at given index', () => {
      const newSlot: TraineeSlot = {
        id: 7,
        data: mockTrainee,
        loading: false
      };

      (component as any).updateContainer(1, newSlot);

      expect(component.containers()[1]).toEqual(newSlot);
    });

    it('should not affect other containers', () => {
      component.containers.set([
        { id: 1, data: null, loading: false },
        null,
        { id: 3, data: null, loading: false }
      ]);

      const newSlot: TraineeSlot = {
        id: 5,
        data: null,
        loading: true
      };

      (component as any).updateContainer(1, newSlot);

      const containers = component.containers();
      expect(containers[0]?.id).toBe(1);
      expect(containers[1]?.id).toBe(5);
      expect(containers[2]?.id).toBe(3);
    });
  });

  describe('toggleThirdContainer()', () => {
    it('should toggle from false to true', () => {
      component.showThirdContainer.set(false);

      component.toggleThirdContainer();

      expect(component.showThirdContainer()).toBe(true);
    });

    it('should toggle from true to false', () => {
      component.showThirdContainer.set(true);

      component.toggleThirdContainer();

      expect(component.showThirdContainer()).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      expect(component.showThirdContainer()).toBe(false);

      component.toggleThirdContainer();
      expect(component.showThirdContainer()).toBe(true);

      component.toggleThirdContainer();
      expect(component.showThirdContainer()).toBe(false);

      component.toggleThirdContainer();
      expect(component.showThirdContainer()).toBe(true);
    });
  });

  describe('drop()', () => {
    let mockDragEvent: Partial<CdkDragDrop<TraineeSlot | null>>;

    beforeEach(() => {
      mockDragEvent = {
        item: { data: 5 } as any,
        previousContainer: { id: 'numberList' } as any,
        container: { id: 'container0' } as any
      };
    });

    it('should do nothing when dropped in same container', () => {
      mockDragEvent.previousContainer = mockDragEvent.container;

      spyOn(component, 'addToContainer');
      spyOn(component, 'swapContainers');

      component.drop(mockDragEvent as CdkDragDrop<TraineeSlot | null>, 0);

      expect(component.addToContainer).not.toHaveBeenCalled();
      expect(component.swapContainers).not.toHaveBeenCalled();
    });

    it('should call addToContainer when dragging from numberList', () => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));

      component.drop(mockDragEvent as CdkDragDrop<TraineeSlot | null>, 0);

      const container = component.containers()[0];
      expect(container?.id).toBe(5);
    });

    it('should call swapContainers when dragging between containers', () => {
      mockDragEvent.previousContainer = { id: 'container1' } as any;
      mockDragEvent.container = { id: 'container0' } as any;

      component.containers.set([
        { id: 1, data: null, loading: false },
        { id: 2, data: null, loading: false },
        null
      ]);

      component.drop(mockDragEvent as CdkDragDrop<TraineeSlot | null>, 0);

      const containers = component.containers();
      expect(containers[0]?.id).toBe(2);
      expect(containers[1]?.id).toBe(1);
    });

    it('should extract correct index from container ID', () => {
      mockDragEvent.previousContainer = { id: 'container2' } as any;

      component.containers.set([
        { id: 1, data: null, loading: false },
        { id: 2, data: null, loading: false },
        { id: 3, data: null, loading: false }
      ]);

      component.drop(mockDragEvent as CdkDragDrop<TraineeSlot | null>, 0);

      const containers = component.containers();
      expect(containers[0]?.id).toBe(3);
      expect(containers[2]?.id).toBe(1);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from subscriptions', () => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));

      component.addToContainer(1, 0);

      spyOn(component['subscription'], 'unsubscribe');

      component.ngOnDestroy();

      expect(component['subscription'].unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: add -> swap -> remove', (done) => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));

      // Add to container 0
      component.addToContainer(1, 0);

      setTimeout(() => {
        // Add to container 1
        component.addToContainer(2, 1);

        setTimeout(() => {
          // Swap containers
          component.swapContainers(0, 1);

          const containers = component.containers();
          expect(containers[0]?.id).toBe(2);
          expect(containers[1]?.id).toBe(1);

          // Remove from container 0
          component.removeFromContainer(0);
          expect(component.containers()[0]).toBe(null);

          done();
        }, 100);
      }, 100);
    });

    it('should correctly track selected numbers throughout operations', () => {
      mockTraineesService.getTraineeDetails.and.returnValue(of(mockTrainee));

      expect(component.totalSelected).toBe(0);

      component.addToContainer(1, 0);
      expect(component.totalSelected).toBe(1);

      component.addToContainer(2, 1);
      expect(component.totalSelected).toBe(2);

      component.removeFromContainer(0);
      expect(component.totalSelected).toBe(1);
    });
  });
});
