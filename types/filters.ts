export type FilterType = 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'checkbox';

export interface FilterField {
  id: string;
  label: string;
  type: FilterType;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  defaultValue?: any;
}

export interface FilterValue {
  [key: string]: any;
}

export interface FilterPanelProps {
  fields: FilterField[];
  onApply: (filters: FilterValue) => void;
  onClear: () => void;
  defaultOpen?: boolean;
  persistKey?: string; // Pour localStorage
}