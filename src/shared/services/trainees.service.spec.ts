import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TraineesService } from './trainees.service';
import { IPosts, ITrainee } from '../interfaces/trainee.interface';

describe('TraineesService', () => {
  let service: TraineesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TraineesService]
    });

    service = TestBed.inject(TraineesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTrainees', () => {
    it('should fetch trainees from API with correct pagination', () => {
      const pageIndex = 2;
      const mockApiResponse: Partial<IPosts>[] = [
        { id: 1, userId: 1, title: 'Post 1', body: 'Body 1' },
        { id: 2, userId: 1, title: 'Post 2', body: 'Body 2' }
      ];

      service.getTrainees(pageIndex).subscribe(trainees => {
        expect(trainees.length).toBe(2);
        expect(trainees[0].id).toBe(1);
        expect(trainees[0].grade).toBeGreaterThanOrEqual(0);
        expect(trainees[0].grade).toBeLessThanOrEqual(100);
        expect(trainees[0].subject).toBeTruthy();
        expect(trainees[0].date).toBeTruthy();
        expect(trainees[0].name).toBeTruthy();
      });

      const req = httpMock.expectOne(`https://jsonplaceholder.typicode.com/posts?_page=${pageIndex}&_limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockApiResponse);
    });

    it('should add random grade, subject, date, and name to each trainee', () => {
      const mockApiResponse: Partial<IPosts>[] = [
        { id: 1, userId: 1, title: 'Post 1', body: 'Body 1' }
      ];

      service.getTrainees(0).subscribe(trainees => {
        const trainee = trainees[0];

        // Check that random fields are added
        expect(typeof trainee.grade).toBe('number');
        expect(trainee.grade).toBeGreaterThanOrEqual(0);
        expect(trainee.grade).toBeLessThanOrEqual(100);

        expect(typeof trainee.subject).toBe('string');
        expect(trainee.subject.length).toBeGreaterThan(0);

        expect(typeof trainee.date).toBe('string');
        expect(trainee.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format

        expect(typeof trainee.name).toBe('string');
        expect(trainee.name).toContain(' '); // Should have first and last name
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts?_page=0&_limit=10');
      req.flush(mockApiResponse);
    });

    it('should handle empty response', () => {
      service.getTrainees(0).subscribe(trainees => {
        expect(trainees).toEqual([]);
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts?_page=0&_limit=10');
      req.flush([]);
    });

    it('should handle HTTP error', () => {
      const errorMessage = 'Server error';

      service.getTrainees(0).subscribe({
        next: () => fail('Should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts?_page=0&_limit=10');
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getTraineeDetails', () => {
    describe('when ID is 10 or less', () => {
      it('should fetch trainee details from API', () => {
        const mockPost: IPosts = {
          id: 5,
          userId: 1,
          title: 'Test',
          body: 'Body',
          name: 'John Doe',
          subject: 'Math',
          date: '2024-01-01',
          grade: 85
        };

        const mockApiResponse: Partial<ITrainee> = {
          id: 5,
          name: 'API Name',
          username: 'apiuser',
          email: 'api@example.com',
          phone: '123-456-7890',
          website: 'example.com',
          address: {
            street: '123 Main St',
            suite: 'Apt 1',
            city: 'New York',
            zipcode: '10001',
            geo: { lat: '40.7128', lng: '-74.0060' }
          },
          company: {
            name: 'API Company',
            catchPhrase: 'Test phrase',
            bs: 'test bs'
          }
        };

        service.getTraineeDetails(mockPost).subscribe(trainee => {
          expect(trainee.id).toBe(5);
          expect(trainee.name).toBe('John Doe'); // Should use post.name
          expect(trainee.username).toBe('apiuser'); // From API
          expect(trainee.email).toBe('api@example.com'); // From API
          expect(trainee.grade).toBe(85); // From post
          expect(trainee.subject).toBe('Math'); // From post
          expect(trainee.date).toBe('2024-01-01'); // From post
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users/5');
        expect(req.request.method).toBe('GET');
        req.flush(mockApiResponse);
      });

      it('should merge API data with post data correctly', () => {
        const mockPost: IPosts = {
          id: 3,
          userId: 1,
          title: 'Test',
          body: 'Body',
          name: 'Jane Smith',
          subject: 'Physics',
          date: '2024-06-15',
          grade: 92
        };

        const mockApiResponse: Partial<ITrainee> = {
          id: 3,
          name: 'Old Name',
          username: 'janesmith',
          email: 'jane@example.com',
          phone: '555-1234',
          website: 'jane.com',
          address: {
            street: '456 Oak Ave',
            suite: 'Suite 200',
            city: 'Chicago',
            zipcode: '60601',
            geo: { lat: '41.8781', lng: '-87.6298' }
          },
          company: {
            name: 'Smith Corp',
            catchPhrase: 'We do things',
            bs: 'innovative solutions'
          }
        };

        service.getTraineeDetails(mockPost).subscribe(trainee => {
          // Post data should override
          expect(trainee.name).toBe('Jane Smith');
          expect(trainee.grade).toBe(92);
          expect(trainee.subject).toBe('Physics');
          expect(trainee.date).toBe('2024-06-15');

          // API data should be preserved
          expect(trainee.username).toBe('janesmith');
          expect(trainee.email).toBe('jane@example.com');
          expect(trainee.address.city).toBe('Chicago');
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users/3');
        req.flush(mockApiResponse);
      });
    });

    describe('when ID is greater than 10', () => {
      it('should return mock data without making HTTP request', (done) => {
        const mockPost: IPosts = {
          id: 15,
          userId: 1,
          title: 'Test',
          body: 'Body',
          name: 'Bob Johnson',
          subject: 'Chemistry',
          date: '2024-03-10',
          grade: 78
        };

        service.getTraineeDetails(mockPost).subscribe(trainee => {
          // Verify it's mock data
          expect(trainee.id).toBe(15);
          expect(trainee.name).toBe('Bob Johnson');
          expect(trainee.grade).toBe(78);
          expect(trainee.subject).toBe('Chemistry');
          expect(trainee.date).toBe('2024-03-10');

          // Check mock data structure
          expect(trainee.username).toBe('bob_johnson');
          expect(trainee.email).toBe('bob.johnson@example.com');
          expect(trainee.website).toBe('bobjohnson.com');
          expect(trainee.company.name).toBe('Bob Corporation');
          expect(trainee.company.catchPhrase).toBe('Innovative solutions for modern problems');

          // Check address is generated
          expect(trainee.address).toBeTruthy();
          expect(trainee.address.street).toContain('Main Street');
          expect(trainee.address.suite).toContain('Apt.');
          expect(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']).toContain(trainee.address.city);
          expect(trainee.address.zipcode.length).toBe(5);

          // Check geo coordinates
          expect(parseFloat(trainee.address.geo.lat)).toBeGreaterThanOrEqual(-90);
          expect(parseFloat(trainee.address.geo.lat)).toBeLessThanOrEqual(90);
          expect(parseFloat(trainee.address.geo.lng)).toBeGreaterThanOrEqual(-180);
          expect(parseFloat(trainee.address.geo.lng)).toBeLessThanOrEqual(180);

          // Check phone format
          expect(trainee.phone).toMatch(/^1-\d{3}-\d{3}-\d{4}$/);

          done();
        });

        // Verify no HTTP request is made
        httpMock.expectNone('https://jsonplaceholder.typicode.com/users/15');
      });

      it('should generate consistent username from name', (done) => {
        const mockPost: IPosts = {
          id: 20,
          userId: 1,
          title: 'Test',
          body: 'Body',
          name: 'Alice Mary Smith',
          subject: 'Math',
          date: '2024-01-01',
          grade: 90
        };

        service.getTraineeDetails(mockPost).subscribe(trainee => {
          expect(trainee.username).toBe('alice_mary_smith');
          expect(trainee.email).toBe('alice.mary.smith@example.com');
          expect(trainee.website).toBe('alicemarysmith.com');
          expect(trainee.company.name).toBe('Alice Corporation');
          done();
        });
      });
    });
  });

  describe('Random helper methods', () => {
    it('should generate grades between 0 and 100', () => {
      const mockApiResponse: Partial<IPosts>[] = [{ id: 1, userId: 1, title: 'Test', body: 'Body' }];

      // Test multiple times to check randomness
      for (let i = 0; i < 10; i++) {
        service.getTrainees(0).subscribe(trainees => {
          const grade = trainees[0].grade;
          expect(grade).toBeGreaterThanOrEqual(0);
          expect(grade).toBeLessThanOrEqual(100);
          expect(Number.isInteger(grade)).toBe(true);
        });

        const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts?_page=0&_limit=10');
        req.flush(mockApiResponse);
      }
    });

    it('should generate valid subject names', () => {
      const validSubjects = [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Computer Science',
        'English Literature',
        'History',
        'Geography',
        'Economics',
        'Psychology'
      ];

      const mockApiResponse: Partial<IPosts>[] = [{ id: 1, userId: 1, title: 'Test', body: 'Body' }];

      service.getTrainees(0).subscribe(trainees => {
        expect(validSubjects).toContain(trainees[0].subject);
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts?_page=0&_limit=10');
      req.flush(mockApiResponse);
    });

    it('should generate dates in YYYY-MM-DD format between 2020 and now', () => {
      const mockApiResponse: Partial<IPosts>[] = [{ id: 1, userId: 1, title: 'Test', body: 'Body' }];

      service.getTrainees(0).subscribe(trainees => {
        const date = trainees[0].date;
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        const dateObj = new Date(date);
        const minDate = new Date(2020, 0, 1);
        const maxDate = new Date();

        expect(dateObj.getTime()).toBeGreaterThanOrEqual(minDate.getTime());
        expect(dateObj.getTime()).toBeLessThanOrEqual(maxDate.getTime());
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts?_page=0&_limit=10');
      req.flush(mockApiResponse);
    });

    it('should generate names with first and last name', () => {
      const mockApiResponse: Partial<IPosts>[] = [{ id: 1, userId: 1, title: 'Test', body: 'Body' }];

      service.getTrainees(0).subscribe(trainees => {
        const name = trainees[0].name;
        const nameParts = name.split(' ');

        expect(nameParts.length).toBe(2); // First and last name
        expect(nameParts[0].length).toBeGreaterThan(0);
        expect(nameParts[1].length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/posts?_page=0&_limit=10');
      req.flush(mockApiResponse);
    });
  });
});
