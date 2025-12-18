import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DashboardService } from '../../services/dashboard.service';
import type { DashboardStats } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, TableModule, TagModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  loading = signal<boolean>(true);

  statusChartData: any;
  statusChartOptions: any;
  municipioChartData: any;
  municipioChartOptions: any;

  constructor(private dashboardService: DashboardService) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.dashboardService.getDashboardStatistics().subscribe({
      next: (data: DashboardStats) => {
        this.stats.set(data);
        this.updateCharts(data);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.loading.set(false);
      },
    });
  }

  private initChartOptions(): void {
    this.statusChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    };

    this.municipioChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    };
  }

  private updateCharts(data: DashboardStats): void {
    // Chart de status
    const statusLabels = data.leadsByStatus.map((s: any) => this.getStatusLabel(s.status));
    const statusData = data.leadsByStatus.map((s: any) => s.count);
    const statusColors = data.leadsByStatus.map((s: any) => this.getStatusColor(s.status));

    this.statusChartData = {
      labels: statusLabels,
      datasets: [
        {
          data: statusData,
          backgroundColor: statusColors,
          borderWidth: 0,
        },
      ],
    };

    this.municipioChartData = {
      labels: data.leadsByMunicipio.map((m: any) => m.municipio),
      datasets: [
        {
          label: 'Leads',
          data: data.leadsByMunicipio.map((m: any) => m.count),
          backgroundColor: '#667eea',
        },
      ],
    };
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      novo: 'Novo',
      contato_inicial: 'Contato Inicial',
      em_negociacao: 'Em Negociação',
      convertido: 'Convertido',
      perdido: 'Perdido',
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      novo: '#3b82f6',
      contato_inicial: '#f59e0b',
      em_negociacao: '#8b5cf6',
      convertido: '#10b981',
      perdido: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    const severities: { [key: string]: 'success' | 'info' | 'warn' | 'danger' } = {
      novo: 'info',
      contato_inicial: 'warn',
      em_negociacao: 'warn',
      convertido: 'success',
      perdido: 'danger',
    };
    return severities[status] || 'info';
  }

  formatArea(area: number): string {
    return area.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
