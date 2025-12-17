import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-propriedades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2>Propriedades Rurais</h2>
    </div>
  `,
  styles: [`
    .card {
      padding: 2rem;
      background: var(--surface-card);
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
  `]
})
export class PropriedadesComponent {}
