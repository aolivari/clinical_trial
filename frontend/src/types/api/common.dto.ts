export interface PaginatedResponseDTO<T> {
  total: number;
  skip: number;
  limit: number;
  items: T[];
}
