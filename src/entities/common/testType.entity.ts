import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("test_types", { schema: "common" })
export class TestType {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "standard" })
  standard!: string;

  @Column("int", { name: "type" })
  type!: number; // [note: "1:drug-test, 2: ancohol test, ..."]

  @Column({ name: "name", default: () => "''" })
  name!: string;

  @Column("int", { name: "index" })
  index!: number;

  @Column("text", { array: true, default: () => "ARRAY[]::text[]", name: "list_term" })
  listTerm!: string[];

  @Column({ name: "abbreviation" })
  abbreviation!: string;

  @Column("int", { name: "record_index" })
  recordIndex!: number;

  @Column({ name: "specimen_type" })
  specimenType!: string;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
