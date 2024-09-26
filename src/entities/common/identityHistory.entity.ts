import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity("identity_histories", { schema: "common" })
export class IdentityHistory {
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

  @Column({ name: "nationality" })
  nationality!: string;

  @Column({ type: "timestamp without time zone", name: "expire_at" })
  expireAt!: Date;

  @Column({ name: "image_url" })
  imageUrl!: string;

  @Column({ name: "user_identity_id" })
  userIdentityId!: string;

  @Column({ name: "name_other_type" })
  nameOtherType!: string;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
