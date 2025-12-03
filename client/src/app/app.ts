import { Component } from '@angular/core';
import { TodoPageComponent } from './todo-page/todo-page.component';
import { FooterComponent } from './footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoPageComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
