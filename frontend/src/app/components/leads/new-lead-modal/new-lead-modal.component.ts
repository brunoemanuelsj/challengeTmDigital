import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
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
export class NewLeadModalComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<any>();

  leadForm!: FormGroup;
  loading = signal<boolean>(false);

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  private initForm() {
    this.leadForm = this.fb.group({
      nome: ["", Validators.required],
      cpf: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      telefone: ["", Validators.required],
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
    // Não adicionamos propriedade vazia por padrão para manter o form limpo
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

      this.onSave.emit(formData);
    } else {
      this.leadForm.markAllAsTouched();
    }
  }

  resetLoading() {
    this.loading.set(false);
  }
}
