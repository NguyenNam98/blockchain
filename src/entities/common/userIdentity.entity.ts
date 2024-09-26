import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_identities", { schema: "common" })
export class UserIdentity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column("int", { name: "type" })
  type!: number; // [note: "1: driver licence, 2: passport, 3: photoId, 4: other"]

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ name: "document_number" })
  documentNumber!: string;

  @Column({ name: "nationality", nullable: true })
  nationality!: string;

  @Column({ type: "timestamp without time zone", name: "expire_at", nullable: true })
  expireAt?: Date;

  @Column({ name: "image_url" })
  imageUrl!: string;

  @Column({ name: "name_other_type", nullable: true })
  nameOtherType?: string;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
