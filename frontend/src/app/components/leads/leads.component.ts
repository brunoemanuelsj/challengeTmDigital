import { CommonModule } from "@angular/common";
import { Component, OnInit, signal, ViewChild } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ToolbarModule } from "primeng/toolbar";
import { TooltipModule } from "primeng/tooltip";
import { MessageService } from "primeng/api";
import type { Lead } from "../../models";
import { LeadsService } from "../../services/leads.service";
import { NewLeadModalComponent } from "./new-lead-modal/new-lead-modal.component";

@Component({
  selector: "app-leads",
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    NewLeadModalComponent,
  ],
  templateUrl: "./leads.component.html",
  styleUrls: ["./leads.component.css"],
})
export class LeadsComponent implements OnInit {
  @ViewChild(NewLeadModalComponent) modal?: NewLeadModalComponent;

  constructor(
    private leadsService: LeadsService,
    private messageService: MessageService
  ) {}

  loading = signal<boolean>(true);

  leads = signal<Lead[]>([]);

  showNewLeadModal = false;

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads() {
    this.loading.set(true);
    this.leads.set([]);

    this.leadsService.getLeads().subscribe({
      next: (data) => {
        this.leads.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error("Erro ao carregar leads:", error);
        this.loading.set(false);
      },
    });
  }

  getSeverity(
    status: string,
  ):
    | "success"
    | "info"
    | "warn"
    | "danger"
    | "secondary"
    | "contrast"
    | undefined {
    switch (status) {
      case "novo":
        return "info";
      case "contato_inicial":
        return "warn";
      case "em_negociacao":
        return "secondary";
      case "convertido":
        return "success";
      case "perdido":
        return "danger";
      default:
        return "contrast";
    }
  }

  onAdd() {
    this.showNewLeadModal = true;
  }

  onSaveLead(leadData: any) {
    this.leadsService.createLead(leadData).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Lead criado com sucesso!",
          life: 3000,
        });
        this.modal?.close();
        this.loadLeads();
      },
      error: (error) => {
        console.error("Erro ao criar lead:", error);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: error.error?.message || "Erro ao criar lead. Tente novamente.",
          life: 5000,
        });
        this.modal?.resetLoading();
      },
    });
  }

  onEdit(lead: any) {
    console.log("Editar lead", lead);
  }

  onDelete(lead: any) {
    console.log("Excluir lead", lead);
  }
}
