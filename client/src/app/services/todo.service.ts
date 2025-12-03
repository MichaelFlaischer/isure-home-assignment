import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Todo } from '../models/todo';
import { environment } from '../../environments/environment';

const TODOS_ENDPOINT = `${environment.apiBaseUrl}/todos`;

@Injectable({ providedIn: 'root' })
export class TodoService {
  constructor(private readonly http: HttpClient) {}

  getTodos(): Observable<Todo[]> {
    return this.http
      .get<Todo[]>(TODOS_ENDPOINT)
      .pipe(catchError(() => this.handleError('Failed to load todos')));
  }

  getTodo(id: string): Observable<Todo> {
    return this.http
      .get<Todo>(`${TODOS_ENDPOINT}/${id}`)
      .pipe(catchError(() => this.handleError('Failed to load todo')));
  }

  createTodo(payload: Omit<Todo, 'id'>): Observable<Todo> {
    return this.http
      .post<Todo>(TODOS_ENDPOINT, payload)
      .pipe(catchError(() => this.handleError('Failed to create todo')));
  }

  updateTodo(id: string, payload: Omit<Todo, 'id'>): Observable<Todo> {
    return this.http
      .put<Todo>(`${TODOS_ENDPOINT}/${id}`, payload)
      .pipe(catchError(() => this.handleError('Failed to update todo')));
  }

  deleteTodo(id: string): Observable<void> {
    return this.http
      .delete<void>(`${TODOS_ENDPOINT}/${id}`)
      .pipe(catchError(() => this.handleError('Failed to delete todo')));
  }

  private handleError(message: string) {
    return throwError(() => new Error(message));
  }
}
