import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../models/todo';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss']
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  @Output() edit = new EventEmitter<Todo>();
  @Output() delete = new EventEmitter<Todo>();
  @Output() toggle = new EventEmitter<Todo>();

  onToggle(): void {
    this.toggle.emit(this.todo);
  }

  onEdit(): void {
    this.edit.emit(this.todo);
  }

  onDelete(): void {
    this.delete.emit(this.todo);
  }
}
