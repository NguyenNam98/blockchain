import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { RequestDeleteUser } from "./requestDeleteUser.entity";

@Entity("users", { schema: "common" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column({ name: "first_name", nullable: true })
  firstName!: string;

  @Column({ name: "last_name", nullable: true })
  lastName!: string;

  @Column({ name: "email" })
  email!: string;

  @Column({ nullable: true })
  mobile?: string;

  @Column({ nullable: true, name: "additional_phone" })
  additionalPhone?: string;

  @Column("int", { default: 0 })
  status!: number; // [note: "0: inactive, 1: active, 2: deleted"]

  @Column({ type: "varchar", nullable: true })
  dob?: string;

  @Column()
  role!: string; // [note: "patient, collector, cm-user, admin"]

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  honorific?: string;

  @Column({ nullable: true })
  sex?: string;

  @Column({ name: "auth_id", nullable: true })
  authId?: string;

  @Column({ name: "is_verified_phone", default: false })
  isVerifiedPhone!: boolean;

  @Column("text", {
    array: true,
    default: () => "ARRAY[]::text[]",
    name: "registration_ids",
  })
  registrationIds!: string[];

  @Column({ nullable: true })
  pin?: string;

  @Column({ nullable: true, name: "avatar_url" })
  avatarUrl?: string;

  @Column({ nullable: true, name: "background_url" })
  backgroundUrl?: string;

  @Column({ nullable: true, name: "registration_number" })
  registrationNumber?: string; // [note: "for admin user"]

  @Column({ nullable: true })
  address1?: string;

  @Column({ nullable: true })
  address2?: string;

  @Column({ nullable: true })
  suburb?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  postcode?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({
    type: "timestamp without time zone",
    default: () => "CURRENT_TIMESTAMP",
    name: "updated_at",
  })
  updatedAt!: Date;

  @Column({
    type: "timestamp without time zone",
    default: () => "CURRENT_TIMESTAMP",
    name: "created_at",
  })
  createdAt!: Date;

  @OneToMany(
    () => RequestDeleteUser,
    (userRequestDelete) => userRequestDelete.user
  )
  userRequestDeletes!: RequestDeleteUser[];
}
