import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "faq_support", schema: "common" })
export class FAQSupport {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column({ nullable: true, name: "file_url" })
  fileUrl!: string;

  @Column({ default: true, name: "is_valid" })
  isValid!: boolean;

  @Column("text")
  message!: string;

  @Column("varchar")
  subject!: string;

  @Column("varchar", { name: "timezone", length: 255, default: "UTC" })
  timezone!: string;

  @CreateDateColumn({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  updatedAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  createdAt!: Date;

  @Column({ name: "user_name", type: "varchar", length: 255 })
  userName!: string;
}
