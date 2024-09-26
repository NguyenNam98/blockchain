import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity"; // Adjust the path if necessary

@Entity("request_delete_user", { schema: "common" })
export class RequestDeleteUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false, name: "is_valid" })
  isValid!: boolean;

  @Column()
  role!: string;

  @Column()
  token!: string;

  @Column({ type: "timestamp without time zone", name: "expire_at" })
  expireAt!: Date;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.userRequestDeletes)
  @JoinColumn({ name: "userId" })
  user!: User | null;

  @Column({ name: "user_id" })
  userId!: string;
}
