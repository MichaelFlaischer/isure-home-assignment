import { Component } from '@angular/core';
import { TodoPageComponent } from './todo-page/todo-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
