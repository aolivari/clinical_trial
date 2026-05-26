export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  items: T[];
}
