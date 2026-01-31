export enum FilterType {
  ID = 'id',
  GRADE = 'grade',
  DATE = 'date',
  GENERAL = 'general'
}

export enum ComparisonOperator {
  GREATER_THAN = '>',
  LESS_THAN = '<'
}

export interface ParsedFilter {
  type: FilterType;
  value: string | number;
  operator?: ComparisonOperator;
}

export interface MonitorFilters {
  selectedIds: number[];
  nameSearch: string;
  showPassed: boolean;
  showFailed: boolean;
}
