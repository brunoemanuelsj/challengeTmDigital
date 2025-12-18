import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PropriedadesService } from '../../services/propriedades.service';
import type { Propriedade, CreatePropriedadeDto, UpdatePropriedadeDto } from '../../models/propriedade.model';
import { NewPropriedadeModalComponent } from './new-propriedade-modal/new-propriedade-modal.component';

@Component({
  selector: 'app-propriedades',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    NewPropriedadeModalComponent,
  ],
  templateUrl: './propriedades.component.html',
  styleUrls: ['./propriedades.component.css']
})
export class PropriedadesComponent implements OnInit {
  @ViewChild(NewPropriedadeModalComponent) modal?: NewPropriedadeModalComponent;

  propriedades = signal<Propriedade[]>([]);
  loading = signal<boolean>(false);
  showModal = false;
  selectedPropriedade: Propriedade | null = null;
  isEditMode = false;

  constructor(
    private propriedadesService: PropriedadesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadPropriedades();
  }

  loadPropriedades(): void {
    this.loading.set(true);
    this.propriedadesService.getPropriedades().subscribe({
      next: (data) => {
        // Garantir que `area_hectares` seja number para ordenação correta
        const normalized = data.map((p: Propriedade) => ({
          ...p,
          area_hectares: p.area_hectares !== null && p.area_hectares !== undefined ? Number(p.area_hectares) : p.area_hectares,
        }));
        this.propriedades.set(normalized);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar propriedades:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar propriedades'
        });
        this.loading.set(false);
      }
    });
  }



  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedPropriedade = null;
    this.showModal = true;
  }

  openEditModal(propriedade: Propriedade): void {
    this.isEditMode = true;
    this.selectedPropriedade = propriedade;
    this.showModal = true;
  }

  onModalHide(): void {
    this.selectedPropriedade = null;
  }

  onSavePropriedade(propriedadeData: any): void {
    const data: CreatePropriedadeDto | UpdatePropriedadeDto = {
      lead_id: propriedadeData.lead_id,
      nome: propriedadeData.nome,
      cultura: propriedadeData.cultura || undefined,
      area_hectares: Number(propriedadeData.area_hectares),
      municipio: propriedadeData.municipio || undefined,
      estado: propriedadeData.estado || undefined,
      geometria: propriedadeData.geometria_wkt || undefined
    };

    const request = this.isEditMode && this.selectedPropriedade
      ? this.propriedadesService.updatePropriedade(this.selectedPropriedade.id, data)
      : this.propriedadesService.createPropriedade(data as CreatePropriedadeDto);

    request.subscribe({
      next: () => {
        this.showModal = false;
        this.loadPropriedades();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: this.isEditMode ? 'Propriedade atualizada com sucesso' : 'Propriedade criada com sucesso'
        });
        this.modal?.resetLoading();
      },
      error: (error) => {
        console.error('Erro ao salvar propriedade:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao salvar propriedade. Tente novamente.'
        });
        this.modal?.resetLoading();
      }
    });
  }

  deletePropriedade(propriedade: Propriedade): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a propriedade "${propriedade.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.propriedadesService.deletePropriedade(propriedade.id).subscribe({
          next: () => {
            this.loadPropriedades();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Propriedade excluída com sucesso'
            });
          },
          error: (error) => {
            console.error('Erro ao excluir propriedade:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir propriedade'
            });
          }
        });
      }
    });
  }
}
