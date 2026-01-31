import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {IPosts, ITrainee} from '../interfaces/trainee.interface';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TraineesService {

  constructor(private http: HttpClient) {
  }

  getTrainees(pageIndex: number): Observable<IPosts[]> {
    return this.http.get<IPosts[]>(`https://jsonplaceholder.typicode.com/posts?_page=${pageIndex}&_limit=10`).pipe(
      map(trainees => trainees.map(trainee => ({
        ...trainee,
        grade: this.getRandomGrade(),
        subject: this.getRandomSubject(),
        date: this.getRandomDate(),
        name: this.getRandomName()
      })))
    );
  }

  getTraineeDetails(post: IPosts): Observable<ITrainee> {
    // If ID is larger than 10, return mock data because the JSON api dose not support more than 10 ids.
    if (post.id > 10) {
      const mockTrainee: ITrainee = {
        id: post.id,
        name: post.name,
        username: post.name.toLowerCase().replace(/\s+/g, '_'),
        email: `${post.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          suite: `Apt. ${Math.floor(Math.random() * 100) + 1}`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          zipcode: `${Math.floor(Math.random() * 90000) + 10000}`,
          geo: {
            lat: (Math.random() * 180 - 90).toFixed(4),
            lng: (Math.random() * 360 - 180).toFixed(4)
          }
        },
        phone: `1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        website: `${post.name.toLowerCase().replace(/\s+/g, '')}.com`,
        company: {
          name: `${post.name.split(' ')[0]} Corporation`,
          catchPhrase: 'Innovative solutions for modern problems',
          bs: 'synergize cutting-edge technologies'
        },
        grade: post.grade,
        subject: post.subject,
        date: post.date
      };

      return new Observable(observer => {
        observer.next(mockTrainee);
        observer.complete();
      });
    }

    // Otherwise, fetch from API
    return this.http.get<ITrainee>(`https://jsonplaceholder.typicode.com/users/${post.id}`).pipe(
      map((trainee: ITrainee) => {
        return {
          ...trainee,
          grade: post.grade,
          subject: post.subject,
          date: post.date,
          name: post.name
        };
      })
    );
  }

  private getRandomGrade(): number {
    return Math.floor(Math.random() * (100 + 1));
  }

  private getRandomSubject(): string {
    const subjects = [
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
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  private getRandomDate(): string {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split('T')[0];
  }

  private getRandomName(): string {
    const firstNames = [
      'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
      'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
      'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth',
      'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
      'Christopher', 'Brian', 'Kevin', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan',
      'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen'
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
      'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
      'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
      'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
    ];

    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${randomFirstName} ${randomLastName}`;
  }
}
