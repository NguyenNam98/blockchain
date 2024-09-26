import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "device_type", schema: "common" })
export class DeviceType {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  createdAt!: Date;

  @Column()
  description!: string;

  @Column({ name: "icon_url" })
  iconUrl!: string;

  @Column()
  index!: string;

  @Column({ default: true, name: "is_valid" })
  isValid!: boolean;

  @Column({ type: "int", name: "key_form" })
  keyForm!: number;

  @Column()
  link!: string;

  @Column()
  name!: string;

  @Column({ name: "test_type_id" })
  testTypeId!: string;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  updatedAt!: Date;
}
