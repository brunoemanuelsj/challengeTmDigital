import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "app-new-lead-modal",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    TooltipModule,
  ],
  templateUrl: "./new-lead-modal.component.html",
  styleUrls: ["./new-lead-modal.component.css"],
})
export class NewLeadModalComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() lead: any = null;
  @Input() isEditMode: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<any>();

  leadForm!: FormGroup;
  loading = signal<boolean>(false);

  statusOptions = [
    { label: 'Novo', value: 'novo' },
    { label: 'Contato Inicial', value: 'contato_inicial' },
    { label: 'Em Negociação', value: 'em_negociacao' },
    { label: 'Convertido', value: 'convertido' },
    { label: 'Perdido', value: 'perdido' },
  ];

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detecta mudanças no lead ou no modo de edição
    if (changes['lead'] || changes['isEditMode']) {
      if (this.isEditMode && this.lead) {
        this.populateForm();
      } else if (!this.isEditMode) {
        // Modo de criação - limpa o formulário
        this.leadForm.reset({ status: "novo" });
        this.propriedades.clear();
      }
    }
  }

  private populateForm() {
    if (this.lead) {
      this.leadForm.patchValue({
        nome: this.lead.nome,
        cpf: this.formatCpf(this.lead.cpf),
        email: this.lead.email,
        telefone: this.formatTelefone(this.lead.telefone),
        status: this.lead.status,
        comentarios: this.lead.comentarios,
      });
    }
  }

  private formatCpf(cpf: string): string {
    if (!cpf) return '';
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return cpf;
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private formatTelefone(telefone: string): string {
    if (!telefone) return '';
    const numbers = telefone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }

  // Validador customizado de CPF
  private cpfValidator(control: any) {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) return { cpfInvalido: true };

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return { cpfInvalido: true };

    return null;
  }

  // Aplica máscara de CPF em tempo real
  onCpfInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    this.leadForm.patchValue({ cpf: value }, { emitEvent: false });
  }

  // Aplica máscara de telefone em tempo real
  onTelefoneInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length <= 11) {
      if (value.length > 6) {
        if (value.length === 11) {
          value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length === 10) {
          value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
          value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        }
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      } else if (value.length > 0) {
        value = value.replace(/(\d{0,2})/, '($1');
      }
    }

    this.leadForm.patchValue({ telefone: value }, { emitEvent: false });
  }

  private initForm() {
    this.leadForm = this.fb.group({
      nome: ["", [Validators.required, Validators.minLength(3)]],
      cpf: ["", [Validators.required, Validators.minLength(14), this.cpfValidator]],
      email: ["", [Validators.required, Validators.email]],
      telefone: ["", [Validators.required, Validators.minLength(14)]],
      status: ["novo", Validators.required],
      comentarios: [""],
      propriedades: this.fb.array([]),
    });
  }

  get propriedades() {
    return this.leadForm.get("propriedades") as FormArray;
  }

  addProperty() {
    const propertyGroup = this.fb.group({
      nome: ["", Validators.required],
      cultura: ["", Validators.required],
      area_hectares: [null, Validators.required],
      municipio: ["", Validators.required],
      estado: ["", Validators.required],
    });
    this.propriedades.push(propertyGroup);
  }

  removeProperty(index: number) {
    this.propriedades.removeAt(index);
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.resetForm();
  }

  resetForm() {
    this.leadForm.reset({ status: "novo" });
    this.propriedades.clear();
    // Não modifica os @Input aqui, pois eles são controlados pelo componente pai
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.leadForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  isPropertyFieldInvalid(index: number, fieldName: string): boolean {
    const property = this.propriedades.at(index);
    const field = property.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  save() {
    if (this.leadForm.valid) {
      this.loading.set(true);

      // Remove formatação de CPF e telefone antes de enviar
      const formData = {
        ...this.leadForm.value,
        cpf: this.leadForm.value.cpf.replace(/\D/g, ""),
        telefone: this.leadForm.value.telefone.replace(/\D/g, ""),
      };

      // Se estiver editando, não envia propriedades
      if (this.isEditMode) {
        delete formData.propriedades;
        this.onSave.emit({ id: this.lead.id, data: formData });
      } else {
        this.onSave.emit(formData);
      }
    } else {
      this.leadForm.markAllAsTouched();
    }
  }

  resetLoading() {
    this.loading.set(false);
  }
}
