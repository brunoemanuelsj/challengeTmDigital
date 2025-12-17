import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, NavbarComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}
