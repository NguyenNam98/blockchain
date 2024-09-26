import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_signatures", { schema: "common" })
export class UserSignature {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ name: "signature_url" })
  signatureUrl!: string;

  @Column({ type: "timestamp without time zone", name: "signed_at" })
  signedAt!: Date;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
