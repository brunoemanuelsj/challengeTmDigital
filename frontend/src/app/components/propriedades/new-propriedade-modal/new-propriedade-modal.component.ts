import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import type { Propriedade } from '../../../models/propriedade.model';

@Component({
  selector: 'app-new-propriedade-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TooltipModule,
  ],
  templateUrl: './new-propriedade-modal.component.html',
  styleUrls: ['./new-propriedade-modal.component.css'],
})
export class NewPropriedadeModalComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() propriedade: Propriedade | null = null;
  @Input() isEditMode: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<any>();

  propriedadeForm!: FormGroup;
  loading = signal<boolean>(false);

  estadosOptions = [
    { label: 'São Paulo', value: 'SP' },
    { label: 'Minas Gerais', value: 'MG' },
    { label: 'Rio de Janeiro', value: 'RJ' },
    { label: 'Paraná', value: 'PR' },
    { label: 'Santa Catarina', value: 'SC' },
    { label: 'Rio Grande do Sul', value: 'RS' },
  ];

  constructor(private fb: FormBuilder) {
    this.initForm();
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
      geometria_wkt: [''],
    });
  }

  private populateForm(): void {
    if (this.propriedade) {
      let geometriaWkt = '';
      if (this.propriedade.geometria && this.propriedade.geometria.type === 'Polygon') {
        const coords = this.propriedade.geometria.coordinates[0];
        const points = coords.map((c: number[]) => `${c[0]} ${c[1]}`).join(',');
        geometriaWkt = `POLYGON((${points}))`;
      }

      this.propriedadeForm.patchValue({
        lead_id: this.propriedade.lead_id,
        nome: this.propriedade.nome,
        cultura: this.propriedade.cultura || '',
        area_hectares: this.propriedade.area_hectares,
        municipio: this.propriedade.municipio || '',
        estado: this.propriedade.estado || '',
        geometria_wkt: geometriaWkt,
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.propriedadeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  save(): void {
    if (this.propriedadeForm.invalid) {
      Object.keys(this.propriedadeForm.controls).forEach((key) => {
        this.propriedadeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.propriedadeForm.value;

    this.onSave.emit(formValue);
  }

  close(): void {
    this.propriedadeForm.reset();
    this.loading.set(false);
    this.visibleChange.emit(false);
  }

  resetLoading(): void {
    this.loading.set(false);
  }
}
