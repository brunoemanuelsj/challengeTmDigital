import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
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
  ],
  templateUrl: "./new-lead-modal.component.html",
  styleUrls: ["./new-lead-modal.component.css"],
})
export class NewLeadModalComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<any>();

  leadForm: FormGroup;

  constructor(private fb: FormBuilder) {
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
    this.leadForm.reset({ status: "novo" });
    this.propriedades.clear();
    this.addProperty();
  }

  save() {
    if (this.leadForm.valid) {
      this.onSave.emit(this.leadForm.value);
      this.close();
    } else {
      this.leadForm.markAllAsTouched();
    }
  }
}
