import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Todo } from '../models/todo';

export interface TodoFormValue {
  id?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

@Component({
  selector: 'app-todo-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-form-modal.component.html',
  styleUrls: ['./todo-form-modal.component.scss']
})
export class TodoFormModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() todo: Todo | null = null;
  @Output() save = new EventEmitter<TodoFormValue>();
  @Output() close = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    isCompleted: [false]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todo'] || (changes['visible'] && changes['visible'].currentValue)) {
      this.patchForm();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, isCompleted } = this.form.getRawValue();
    this.save.emit({
      ...(this.todo?.id ? { id: this.todo.id } : {}),
      title: title.trim(),
      description: description?.trim() || undefined,
      isCompleted
    });
  }

  onClose(): void {
    this.close.emit();
  }

  private patchForm(): void {
    if (!this.visible) {
      return;
    }

    if (this.todo) {
      this.form.setValue({
        title: this.todo.title,
        description: this.todo.description ?? '',
        isCompleted: this.todo.isCompleted
      });
    } else {
      this.form.reset({ title: '', description: '', isCompleted: false });
    }
  }
}
