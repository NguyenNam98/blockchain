import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("forgot_pin_requests", { schema: "common" })
export class ForgotPinRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "email" })
  email!: string;

  @Column({ name: "code" })
  code!: string;

  @Column({ name: "token" })
  token!: string;

  @Column({ type: "timestamp without time zone", name: "expire_at" })
  expireAt!: Date;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
