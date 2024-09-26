import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("forgot_password_requests", { schema: "common" })
export class ForgotPasswordRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column()
  role!: string;

  @Column()
  email!: string;

  @Column("varchar", { name: "code", length: 6 })
  code!: string;

  @Column({ type: "timestamp without time zone", name: "expire_at" })
  expireAt!: Date;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
