import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "faq_types" })
export class FAQType {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: true, name: "is_valid" })
  isValid!: boolean;

  @Column()
  app!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  type!: string;

  @Column()
  index!: number;


  @CreateDateColumn({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP", name: "updated_at" })
  updatedAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", default: () => "CURRENT_TIMESTAMP", name: "created_at" })
  createdAt!: Date;
}
