import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "communications", schema: "common" })
export class Communications {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "jsonb", nullable: true })
  attachments!: any[];

  @Column()
  audience!: string;

  @Column()
  category!: string;

  @Column({ name: "collection_organization_id" })
  collectionOrganizationId!: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  createdAt!: Date;

  @Column()
  email!: string;

  @Column({ type: "text", name: "email_template" })
  htmlTemplate!: string;

  @Column({ default: true, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "receiver_id" })
  receiverId!: string;

  @Column({ name: "sender_id" })
  senderId!: string;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  updatedAt!: Date;
}
