import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("user_histories", { schema: "common" })
export class UserHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "first_name" })
  firstName!: string;

  @Column({ name: "last_name" })
  lastName!: string;

  @Column({ name: "email" })
  email!: string;

  @Column({ name: "mobile" })
  mobile!: string;

  @Column({ name: "additional_phone", nullable: true })
  additionalPhone?: string;

  @Column({ name: "status" })
  status!: string; // [note: "0: inactive, 1: active, 2: deleted"]

  @Column({ type: "timestamp without time zone", name: "dob" })
  dob!: Date;

  @Column({ name: "role" })
  role!: string; // [note: " patient, collector, cm-user, admin"]

  @Column({ name: "title", nullable: true })
  title?: string;

  @Column({ name: "honorific", nullable: true })
  honorific?: string;

  @Column({ name: "sex", nullable: true })
  sex?: string;

  @Column({ name: "auth_id" })
  authId!: string;

  @Column({ default: false, name: "is_verified_phone" })
  isVerifiedPhone!: boolean;

  @Column("text", { array: true, default: () => "ARRAY[]::text[]", name: "registration_ids" })
  registrationIds!: string[];

  @Column("int", { name: "pin" })
  pin!: number;

  @Column({ name: "avatar_url", nullable: true })
  avatarUrl?: string;

  @Column({ name: "background_url", nullable: true })
  backgroundUrl?: string;

  @Column({ name: "registration_number", nullable: true })
  registrationNumber?: string; // [note: "for admin user"]

  @Column({ name: "address1", nullable: true })
  address1?: string;

  @Column({ name: "address2", nullable: true })
  address2?: string;

  @Column({ name: "suburb", nullable: true })
  suburb?: string;

  @Column({ name: "state", nullable: true })
  state?: string;

  @Column({ name: "postcode", nullable: true })
  postcode?: string;

  @Column({ name: "country", nullable: true })
  country?: string;

  @Column({ name: "user_id" })
  userId!: string;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
