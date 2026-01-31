import { TestBed } from '@angular/core/testing';
import { SearchFilterService } from './search-filter.service';
import { ComparisonOperator, FilterType } from '../interfaces/filters.interface';
import { IPosts } from '../interfaces/trainee.interface';

describe('SearchFilterService', () => {
  let service: SearchFilterService;
  let mockTrainee: IPosts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchFilterService);

    // Mock trainee for testing
    mockTrainee = {
      id: 5,
      userId: 1,
      title: 'Test Title',
      body: 'Test Body',
      name: 'John Doe',
      subject: 'Mathematics',
      date: '2024-01-15',
      grade: 85
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Signals', () => {
    it('should initialize searchTerm as empty string', () => {
      expect(service.searchTerm()).toBe('');
    });

    it('should initialize pageIndex as 0', () => {
      expect(service.pageIndex()).toBe(0);
    });

    it('should update searchTerm signal', () => {
      service.searchTerm.set('test search');
      expect(service.searchTerm()).toBe('test search');
    });

    it('should update pageIndex signal', () => {
      service.pageIndex.set(5);
      expect(service.pageIndex()).toBe(5);
    });
  });

  describe('parseSearchTerm', () => {
    describe('ID search', () => {
      it('should parse "id:5" as ID filter', () => {
        const result = service.parseSearchTerm('id:5');
        expect(result.type).toBe(FilterType.ID);
        expect(result.value).toBe(5);
      });

      it('should parse "ID:10" (case insensitive)', () => {
        const result = service.parseSearchTerm('ID:10');
        expect(result.type).toBe(FilterType.ID);
        expect(result.value).toBe(10);
      });

      it('should parse "id: 123" with spaces', () => {
        const result = service.parseSearchTerm('id: 123');
        expect(result.type).toBe(FilterType.ID);
        expect(result.value).toBe(123);
      });
    });

    describe('Grade search', () => {
      it('should parse "> 75" as GREATER_THAN grade filter', () => {
        const result = service.parseSearchTerm('> 75');
        expect(result.type).toBe(FilterType.GRADE);
        expect(result.value).toBe(75);
        expect(result.operator).toBe(ComparisonOperator.GREATER_THAN);
      });

      it('should parse "< 50" as LESS_THAN grade filter', () => {
        const result = service.parseSearchTerm('< 50');
        expect(result.type).toBe(FilterType.GRADE);
        expect(result.value).toBe(50);
        expect(result.operator).toBe(ComparisonOperator.LESS_THAN);
      });

      it('should parse ">85.5" with decimal grades', () => {
        const result = service.parseSearchTerm('>85.5');
        expect(result.type).toBe(FilterType.GRADE);
        expect(result.value).toBe(85.5);
        expect(result.operator).toBe(ComparisonOperator.GREATER_THAN);
      });
    });

    describe('Date search', () => {
      it('should parse "> 2024-01-01" as GREATER_THAN date filter', () => {
        const result = service.parseSearchTerm('> 2024-01-01');
        expect(result.type).toBe(FilterType.DATE);
        expect(result.value).toBe('2024-01-01');
        expect(result.operator).toBe(ComparisonOperator.GREATER_THAN);
      });

      it('should parse "< 2024-12-31" as LESS_THAN date filter', () => {
        const result = service.parseSearchTerm('< 2024-12-31');
        expect(result.type).toBe(FilterType.DATE);
        expect(result.value).toBe('2024-12-31');
        expect(result.operator).toBe(ComparisonOperator.LESS_THAN);
      });
    });

    describe('General search', () => {
      it('should parse "John" as general search', () => {
        const result = service.parseSearchTerm('John');
        expect(result.type).toBe(FilterType.GENERAL);
        expect(result.value).toBe('John');
      });

      it('should parse "Mathematics" as general search', () => {
        const result = service.parseSearchTerm('Mathematics');
        expect(result.type).toBe(FilterType.GENERAL);
        expect(result.value).toBe('Mathematics');
      });

      it('should parse empty string as general search', () => {
        const result = service.parseSearchTerm('');
        expect(result.type).toBe(FilterType.GENERAL);
        expect(result.value).toBe('');
      });
    });
  });

  describe('filterById', () => {
    it('should return true when IDs match', () => {
      const result = service.filterById(mockTrainee, 5);
      expect(result).toBe(true);
    });

    it('should return false when IDs do not match', () => {
      const result = service.filterById(mockTrainee, 10);
      expect(result).toBe(false);
    });
  });

  describe('filterByGrade', () => {
    it('should return true for GREATER_THAN when trainee grade is higher', () => {
      const result = service.filterByGrade(mockTrainee, 80, ComparisonOperator.GREATER_THAN);
      expect(result).toBe(true);
    });

    it('should return false for GREATER_THAN when trainee grade is lower', () => {
      const result = service.filterByGrade(mockTrainee, 90, ComparisonOperator.GREATER_THAN);
      expect(result).toBe(false);
    });

    it('should return false for GREATER_THAN when grades are equal', () => {
      const result = service.filterByGrade(mockTrainee, 85, ComparisonOperator.GREATER_THAN);
      expect(result).toBe(false);
    });

    it('should return true for LESS_THAN when trainee grade is lower', () => {
      const result = service.filterByGrade(mockTrainee, 90, ComparisonOperator.LESS_THAN);
      expect(result).toBe(true);
    });

    it('should return false for LESS_THAN when trainee grade is higher', () => {
      const result = service.filterByGrade(mockTrainee, 80, ComparisonOperator.LESS_THAN);
      expect(result).toBe(false);
    });

    it('should return false for LESS_THAN when grades are equal', () => {
      const result = service.filterByGrade(mockTrainee, 85, ComparisonOperator.LESS_THAN);
      expect(result).toBe(false);
    });

    it('should handle undefined grade as 0', () => {
      const traineeWithoutGrade = { ...mockTrainee, grade: undefined as any };
      const result = service.filterByGrade(traineeWithoutGrade, 10, ComparisonOperator.LESS_THAN);
      expect(result).toBe(true);
    });

    it('should return false for invalid operator', () => {
      const result = service.filterByGrade(mockTrainee, 85, 'invalid' as ComparisonOperator);
      expect(result).toBe(false);
    });
  });

  describe('filterByDate', () => {
    it('should return true for GREATER_THAN when trainee date is later', () => {
      const result = service.filterByDate(mockTrainee, '2024-01-01', ComparisonOperator.GREATER_THAN);
      expect(result).toBe(true);
    });

    it('should return false for GREATER_THAN when trainee date is earlier', () => {
      const result = service.filterByDate(mockTrainee, '2024-12-31', ComparisonOperator.GREATER_THAN);
      expect(result).toBe(false);
    });

    it('should return true for LESS_THAN when trainee date is earlier', () => {
      const result = service.filterByDate(mockTrainee, '2024-12-31', ComparisonOperator.LESS_THAN);
      expect(result).toBe(true);
    });

    it('should return false for LESS_THAN when trainee date is later', () => {
      const result = service.filterByDate(mockTrainee, '2024-01-01', ComparisonOperator.LESS_THAN);
      expect(result).toBe(false);
    });

    it('should return false when trainee has no date', () => {
      const traineeWithoutDate = { ...mockTrainee, date: '' };
      const result = service.filterByDate(traineeWithoutDate, '2024-01-01', ComparisonOperator.GREATER_THAN);
      expect(result).toBe(false);
    });

    it('should return false for invalid operator', () => {
      const result = service.filterByDate(mockTrainee, '2024-01-01', 'invalid' as ComparisonOperator);
      expect(result).toBe(false);
    });
  });

  describe('filterByGeneralSearch', () => {
    it('should return true when name matches (case insensitive)', () => {
      const result = service.filterByGeneralSearch(mockTrainee, 'john');
      expect(result).toBe(true);
    });

    it('should return true when name partially matches', () => {
      const result = service.filterByGeneralSearch(mockTrainee, 'doe');
      expect(result).toBe(true);
    });

    it('should return true when subject matches', () => {
      const result = service.filterByGeneralSearch(mockTrainee, 'math');
      expect(result).toBe(true);
    });

    it('should return true when grade matches', () => {
      const result = service.filterByGeneralSearch(mockTrainee, '85');
      expect(result).toBe(true);
    });

    it('should return false when nothing matches', () => {
      const result = service.filterByGeneralSearch(mockTrainee, 'xyz');
      expect(result).toBe(false);
    });

    it('should handle undefined subject', () => {
      const traineeWithoutSubject = { ...mockTrainee, subject: undefined as any };
      const result = service.filterByGeneralSearch(traineeWithoutSubject, 'john');
      expect(result).toBe(true);
    });

    it('should handle undefined grade', () => {
      const traineeWithoutGrade = { ...mockTrainee, grade: undefined as any };
      const result = service.filterByGeneralSearch(traineeWithoutGrade, 'john');
      expect(result).toBe(true);
    });

    it('should be case insensitive for all fields', () => {
      expect(service.filterByGeneralSearch(mockTrainee, 'JOHN')).toEqual(true);
      expect(service.filterByGeneralSearch(mockTrainee, 'MATHEMATICS')).toEqual(true);
    });
  });
});
