import { Component, signal } from '@angular/core';
import { LeadsService } from '../../services/leads.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [ButtonModule, CommonModule],
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css'],
})
export class LeadsComponent {
  lead = signal<any>(null);
  isLoading = signal<boolean>(false);

  constructor(private leadsService: LeadsService) {}

  loadLead() {
    this.isLoading.set(true);

    setTimeout(() => {
      this.leadsService.getOneLead().subscribe({
      next: (data) => {
        this.lead.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Erro:', err);
        this.isLoading.set(false);
      }
    });
    }, 1500);


  }
}
