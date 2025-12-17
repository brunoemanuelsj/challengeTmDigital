import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import type { Propriedade } from '../../../models/propriedade.model';
import type { Lead } from '../../../models/lead.model';
import { LeadsService } from '../../../services/leads.service';

interface Vertice {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-new-propriedade-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TooltipModule,
  ],
  templateUrl: './new-propriedade-modal.component.html',
  styleUrls: ['./new-propriedade-modal.component.css'],
})
export class NewPropriedadeModalComponent implements OnChanges, OnInit {
  @Input() visible: boolean = false;
  @Input() propriedade: Propriedade | null = null;
  @Input() isEditMode: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<any>();

  propriedadeForm!: FormGroup;
  loading = signal<boolean>(false);
  leads = signal<Lead[]>([]);
  vertices = signal<Vertice[]>([]);
  newVertice = { latitude: null, longitude: null };

  estadosOptions = [
    { label: 'São Paulo', value: 'SP' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Santa Catarina', value: 'SC' },
    { label: 'Rio Grande do Sul', value: 'RS' },
  ];

  constructor(private fb: FormBuilder, private leadsService: LeadsService) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadLeads();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propriedade'] || changes['isEditMode']) {
      if (this.isEditMode && this.propriedade) {
        this.populateForm();
      } else if (!this.isEditMode) {
        this.propriedadeForm.reset();
      }
    }
  }

  private initForm(): void {
    this.propriedadeForm = this.fb.group({
      lead_id: ['', [Validators.required]],
      nome: ['', [Validators.required]],
      cultura: [''],
      area_hectares: [null, [Validators.required, Validators.min(0.01)]],
      municipio: [''],
      estado: [''],
    });
  }

  private loadLeads(): void {
    this.leadsService.getLeads().subscribe({
      next: (leads) => this.leads.set(leads),
      error: (error) => console.error('Erro ao carregar leads:', error)
    });
  }

  private populateForm(): void {
    if (this.propriedade) {
      // Extrair vértices do polígono
      const loadedVertices: Vertice[] = [];
      if (this.propriedade.geometria && this.propriedade.geometria.type === 'Polygon') {
        const coords = this.propriedade.geometria.coordinates[0];
        // Remover o último ponto (que é igual ao primeiro para fechar o polígono)
        for (let i = 0; i < coords.length - 1; i++) {
          loadedVertices.push({
            longitude: coords[i][0],
            latitude: coords[i][1]
          });
        }
      }
      this.vertices.set(loadedVertices);

      this.propriedadeForm.patchValue({
        lead_id: this.propriedade.lead_id,
        nome: this.propriedade.nome,
        cultura: this.propriedade.cultura || '',
        area_hectares: this.propriedade.area_hectares,
        municipio: this.propriedade.municipio || '',
        estado: this.propriedade.estado || '',
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.propriedadeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  addVertice(): void {
    if (this.newVertice.latitude !== null && this.newVertice.longitude !== null) {
      this.vertices.update(vertices => [
        ...vertices,
        { latitude: this.newVertice.latitude!, longitude: this.newVertice.longitude! }
      ]);
      this.newVertice = { latitude: null, longitude: null };
    }
  }

  removeVertice(index: number): void {
    this.vertices.update(vertices => vertices.filter((_, i) => i !== index));
  }

  canAddVertice(): boolean {
    return this.newVertice.latitude !== null && this.newVertice.longitude !== null;
  }

  save(): void {
    if (this.propriedadeForm.invalid) {
      Object.keys(this.propriedadeForm.controls).forEach((key) => {
        this.propriedadeForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Validar que tem pelo menos 3 vértices para formar um polígono
    if (this.vertices().length < 3) {
      alert('É necessário adicionar pelo menos 3 vértices para formar o polígono da propriedade.');
      return;
    }

    this.loading.set(true);
    const formValue = { ...this.propriedadeForm.value };

    // Converter vértices para geometria WKT (formato POLYGON)
    const points = this.vertices()
      .map(v => `${v.longitude} ${v.latitude}`)
      .join(', ');

    // Adicionar o primeiro ponto no final para fechar o polígono
    const firstVertex = this.vertices()[0];
    formValue.geometria_wkt = `POLYGON((${points}, ${firstVertex.longitude} ${firstVertex.latitude}))`;

    this.onSave.emit(formValue);
  }

  close(): void {
    this.propriedadeForm.reset();
    this.vertices.set([]);
    this.newVertice = { latitude: null, longitude: null };
    this.loading.set(false);
    this.visibleChange.emit(false);
  }

  resetLoading(): void {
    this.loading.set(false);
  }
}
