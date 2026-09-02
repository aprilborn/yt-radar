export type Nullable<T> = T | null;

export interface PaginatorModel {
  total: number;
  page: number;
  limit: number;
}
