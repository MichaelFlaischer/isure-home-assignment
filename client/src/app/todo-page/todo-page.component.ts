import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Todo } from '../models/todo';
import { TodoService } from '../services/todo.service';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoFormModalComponent, TodoFormValue } from '../todo-form-modal/todo-form-modal.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export type FilterMode = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-todo-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatButtonToggleModule, MatPaginatorModule, TodoListComponent, TodoFormModalComponent, ConfirmDialogComponent],
  templateUrl: './todo-page.component.html',
  styleUrls: ['./todo-page.component.scss']
})
export class TodoPageComponent implements OnInit {
  private readonly todoService = inject(TodoService);

  readonly todos = signal<Todo[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly filterMode = signal<FilterMode>('all');
  readonly showEditModal = signal(false);
  readonly showDeleteModal = signal(false);
  readonly selectedTodo = signal<Todo | null>(null);
  private readonly todoToDelete = signal<Todo | null>(null);

  readonly filteredTodos = computed(() => {
    const mode = this.filterMode();
    const todos = this.todos();
    if (mode === 'active') {
      return todos.filter((todo) => !todo.isCompleted);
    }
    if (mode === 'completed') {
      return todos.filter((todo) => todo.isCompleted);
    }
    return todos;
  });

  readonly totalCount = computed(() => this.todos().length);
  readonly activeCount = computed(() => this.todos().filter(t => !t.isCompleted).length);
  readonly doneCount = computed(() => this.todos().filter(t => t.isCompleted).length);

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [5, 10, 25, 50];

  readonly paginatedTodos = computed(() => {
    const filtered = this.filteredTodos();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  readonly totalFiltered = computed(() => this.filteredTodos().length);

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load todos');
        this.loading.set(false);
      }
    });
  }

  onFilterChange(mode: FilterMode): void {
    this.filterMode.set(mode);
    this.pageIndex.set(0); // Reset to first page when filter changes
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onAddTodo(): void {
    this.selectedTodo.set(null);
    this.showEditModal.set(true);
  }

  onEditTodo(todo: Todo): void {
    this.selectedTodo.set({ ...todo });
    this.showEditModal.set(true);
  }

  onSaveTodo(formValue: TodoFormValue): void {
    const snapshot = this.todos();
    if (formValue.id) {
      const payload = this.stripId(formValue);
      this.todos.set(snapshot.map((todo) => (todo.id === formValue.id ? { ...todo, ...formValue } : todo)));
      this.todoService.updateTodo(formValue.id, payload).subscribe({
        next: (updated) => this.todos.set(this.replaceTodo(updated)),
        error: (err) => this.error.set(err.message ?? 'Failed to update todo')
      });
    } else {
      const payload = this.stripId(formValue);
      const optimisticId = this.generateTempId();
      const optimisticTodo: Todo = { id: optimisticId, ...payload };
      this.todos.set([...snapshot, optimisticTodo]);
      this.todoService.createTodo(payload).subscribe({
        next: (created) => this.todos.set(this.replaceTodo(created, optimisticId)),
        error: (err) => {
          this.error.set(err.message ?? 'Failed to create todo');
          this.todos.set(snapshot);
        }
      });
    }

    this.closeEditModal();
  }

  onDeleteTodo(todo: Todo): void {
    this.todoToDelete.set(todo);
    this.showDeleteModal.set(true);
  }

  onConfirmDelete(): void {
    const todo = this.todoToDelete();
    if (!todo) {
      return;
    }

    const snapshot = this.todos();
    this.todos.set(snapshot.filter((t) => t.id !== todo.id));
    this.todoService.deleteTodo(todo.id).subscribe({
      error: (err) => {
        this.error.set(err.message ?? 'Failed to delete todo');
        this.todos.set(snapshot);
      }
    });

    this.closeDeleteModal();
  }

  onCancelDelete(): void {
    this.closeDeleteModal();
  }

  onToggle(todo: Todo): void {
    const payload = { title: todo.title, description: todo.description, isCompleted: !todo.isCompleted };
    this.todos.set(this.todos().map((t) => (t.id === todo.id ? { ...t, isCompleted: !todo.isCompleted } : t)));
    this.todoService.updateTodo(todo.id, payload).subscribe({
      next: (updated) => this.todos.set(this.replaceTodo(updated)),
      error: (err) => {
        this.error.set(err.message ?? 'Failed to update todo');
        this.todos.set(this.todos().map((t) => (t.id === todo.id ? todo : t)));
      }
    });
  }

  onCloseEditModal(): void {
    this.closeEditModal();
  }

  private closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedTodo.set(null);
  }

  private closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.todoToDelete.set(null);
  }

  private stripId(todo: TodoFormValue): Omit<Todo, 'id'> {
    return {
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted
    };
  }

  private replaceTodo(updated: Todo, matchingId?: string): Todo[] {
    const matchId = matchingId ?? updated.id;
    return this.todos().map((todo) => (todo.id === matchId ? updated : todo));
  }

  private generateTempId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 11);
  }
}
