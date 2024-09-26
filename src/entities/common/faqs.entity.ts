import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "faqs" })

@Entity("FAQ", { schema: "common" })
export class FAQ {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: true, name: "is_valid" })
  isValid!: boolean;

  @Column("jsonb")
  answer!: { class: string[], content: string, htmlContent: string, value: string[] };

  @Column("text")
  app!: string;

  @Column("text", { name: "faq_type_id" })
  faqTypeId!: string;

  @Column("int")
  index!: number;

  @Column("text")
  question!: string;

  @CreateDateColumn({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  updatedAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  createdAt!: Date;
}
