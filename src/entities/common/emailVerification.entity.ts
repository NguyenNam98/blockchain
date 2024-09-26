import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("email_verifications", { schema: "common" })
export class EmailVerification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  code!: string;

  @Column()
  role!: string;

  @Column({ type: "timestamp without time zone", name: "expire_at" })
  expireAt!: Date;

  @CreateDateColumn({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  updatedAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  createdAt!: Date;
}
