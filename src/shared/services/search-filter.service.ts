import {Injectable, signal, WritableSignal} from '@angular/core';
import {ComparisonOperator, FilterType, ParsedFilter} from '../interfaces/filters.interface';
import {IPosts, ITrainee} from '../interfaces/trainee.interface';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  public searchTerm: WritableSignal<string> = signal('');
  public pageIndex: WritableSignal<number> = signal<number>(0);

  constructor() {
  }

  parseSearchTerm(searchTerm: string): ParsedFilter {
    const idMatch = searchTerm.match(/^id:\s*(\d+)$/i);
    if (idMatch) {
      return {
        type: FilterType.ID,
        value: parseInt(idMatch[1])
      };
    }

    const gradeMatch = searchTerm.match(/^([><])\s*(\d+(?:\.\d+)?)$/);
    if (gradeMatch) {
      return {
        type: FilterType.GRADE,
        value: parseFloat(gradeMatch[2]),
        operator: gradeMatch[1] as ComparisonOperator
      };
    }

    const dateMatch = searchTerm.match(/^([><])\s*(\d{4}-\d{2}-\d{2})$/);
    if (dateMatch) {
      return {
        type: FilterType.DATE,
        value: dateMatch[2],
        operator: dateMatch[1] as ComparisonOperator
      };
    }

    // Default to general search
    return {
      type: FilterType.GENERAL,
      value: searchTerm
    };
  }

  filterById(trainee: IPosts, id: number): boolean {
    return trainee.id === id;
  }

  filterByGrade(trainee: IPosts, gradeValue: number, operator: ComparisonOperator): boolean {
    const traineeGrade = trainee.grade ?? 0;

    if (operator === ComparisonOperator.GREATER_THAN) {
      return traineeGrade > gradeValue;
    }

    if (operator === ComparisonOperator.LESS_THAN) {
      return traineeGrade < gradeValue;
    }

    return false;
  }

  filterByDate(trainee: IPosts, dateValue: string, operator: ComparisonOperator): boolean {
    if (!trainee.date) {
      return false;
    }

    const traineeDate = new Date(trainee.date);
    const filterDate = new Date(dateValue);

    if (operator === ComparisonOperator.GREATER_THAN) {
      return traineeDate > filterDate;
    }

    if (operator === ComparisonOperator.LESS_THAN) {
      return traineeDate < filterDate;
    }

    return false;
  }

  filterByGeneralSearch(trainee: IPosts, searchValue: string): boolean {
    const value = searchValue.toLowerCase();
    return (
      trainee.name.toLowerCase().includes(value) ||
      trainee.subject?.toLowerCase().includes(value) ||
      trainee.grade?.toString().includes(value)
    );
  }

}
