import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("agreements", { schema: "common" })
export class Agreements {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "app" })
  app!: number;

  @Column({ name: "content" })
  content!: string;

  @Column({ name: "type" })
  type!: number;

  @Column({ name: "version" })
  version!: number;

  @Column({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;
}
