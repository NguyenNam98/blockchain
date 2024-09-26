import {Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity("notifications", { schema: "common" })
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "app_type" })
  appType!: string;

  @Column({ name: "badge_count" })
  badgeCount!: number;

  @Column({ name: "body" })
  body!: string;

  @Column({ name: "html_body" })
  htmlBody!: string;

  @Column({ default: false, name: "is_archive" })
  isArchive!: boolean;

  @Column({ default: false, name: "is_read" })
  isRead!: boolean;

  @Column({ name: "title" })
  title!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ name: "description" })
  description!: string;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
