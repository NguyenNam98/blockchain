import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Type } from "class-transformer";

@Entity("test_type_preferences", { schema: "onsite" })
export class TestTypePreference {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "onsite_job_id" })
  onsiteJobId!: string;

  @Column({ name: "test_type_id", nullable: true })
  testTypeId!: string;

  @Column({ name: "type", type: "int" })
  type!: number;

  @Column({ name: "device_id", nullable: true })
  deviceId!: string;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  @Type(() => Date)
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  @Type(() => Date)
  updatedAt!: Date;

  @Column({ name: "name" })
  name!: string;
}
