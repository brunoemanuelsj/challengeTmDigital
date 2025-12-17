import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("leads")
export class Lead {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "nome", type: "varchar", length: 255 })
  nome: string;

  @Column({ name: "cpf", type: "varchar", length: 11, unique: true })
  cpf: string;

  @Column({ name: "email", type: "varchar", length: 255, nullable: true })
  email?: string;

  @Column({ name: "telefone", type: "varchar", length: 20, nullable: true })
  telefone?: string;

  @Column({ name: "status", type: "varchar", length: 50, default: "novo" })
  status: string;

  @Column({ name: "comentarios", type: "text", nullable: true })
  comentarios?: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at: Date;

  @Column({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  updated_at: Date;
}
