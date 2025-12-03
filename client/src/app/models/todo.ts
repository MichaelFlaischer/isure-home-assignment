export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  createdAt?: string;
}
