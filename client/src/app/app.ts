import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from './models/todo';
import { TodoService } from './services/todo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  todos: Todo[] = [];
  loading = false;
  error: string | null = null;
  newTitle = '';
  newDescription = '';
  editingTodo: Todo | null = null;

  constructor(private readonly todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.error = null;

    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message ?? 'Failed to load todos';
        this.loading = false;
      }
    });
  }

  addTodo(): void {
    const title = this.newTitle.trim();
    if (!title || this.editingTodo) {
      return;
    }

    const payload = this.buildPayload(title, this.newDescription, false);
    this.todoService.createTodo(payload).subscribe({
      next: (created) => {
        this.todos = [...this.todos, created];
        this.clearForm();
      },
      error: (err) => (this.error = err.message ?? 'Failed to create todo')
    });
  }

  startEdit(todo: Todo): void {
    this.editingTodo = { ...todo };
    this.newTitle = todo.title;
    this.newDescription = todo.description ?? '';
  }

  cancelEdit(): void {
    this.editingTodo = null;
    this.clearForm();
  }

  saveEdit(): void {
    if (!this.editingTodo) {
      return;
    }

    const title = this.newTitle.trim();
    if (!title) {
      return;
    }

    const payload = this.buildPayload(title, this.newDescription, this.editingTodo.isCompleted);
    this.todoService.updateTodo(this.editingTodo.id, payload).subscribe({
      next: (updated) => {
        this.todos = this.todos.map((t) => (t.id === updated.id ? updated : t));
        this.cancelEdit();
      },
      error: (err) => (this.error = err.message ?? 'Failed to update todo')
    });
  }

  toggleCompleted(todo: Todo): void {
    const payload = this.buildPayload(todo.title, todo.description ?? '', !todo.isCompleted);
    this.todoService.updateTodo(todo.id, payload).subscribe({
      next: (updated) => {
        this.todos = this.todos.map((t) => (t.id === updated.id ? updated : t));
      },
      error: (err) => (this.error = err.message ?? 'Failed to update todo')
    });
  }

  deleteTodo(todo: Todo): void {
    if (!confirm(`Delete "${todo.title}"?`)) {
      return;
    }

    this.todoService.deleteTodo(todo.id).subscribe({
      next: () => {
        this.todos = this.todos.filter((t) => t.id !== todo.id);
        if (this.editingTodo?.id === todo.id) {
          this.cancelEdit();
        }
      },
      error: (err) => (this.error = err.message ?? 'Failed to delete todo')
    });
  }

  private buildPayload(title: string, description: string, isCompleted: boolean): Omit<Todo, 'id'> {
    const trimmedDescription = description.trim();
    return {
      title,
      isCompleted,
      ...(trimmedDescription ? { description: trimmedDescription } : {})
    };
  }

  private clearForm(): void {
    this.newTitle = '';
    this.newDescription = '';
  }
}
