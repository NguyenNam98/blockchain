import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("notes", { schema: "common" })
export class Note {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "note" })
  note!: string;

  @Column("text", { array: true, default: () => "ARRAY[]::text[]", name: "audio_urls" })
  audioUrls?: string[];

  @Column("text", { array: true, default: () => "ARRAY[]::text[]", name: "image_urls", nullable: true })
  imageUrls?: string[];

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
