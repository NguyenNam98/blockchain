import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'
@Entity('users', { schema: 'users' })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: 'boolean',
    name: 'is_valid',
    width: 1,
    default: () => true,
  })
  isValid: boolean


  @Column('varchar', {
    name: 'mail_address',
    nullable: true,
    length: 64,
  })
  email: string | null

  @Column('varchar', {
    name: 'password',
    nullable: true,
    length: 64,
  })
  password: string | null


  @Column('varchar', {
    name: 'user_name',
    nullable: true,
    length: 64,
  })
  userName: string | null

  @Column('varchar', {
    name: 'private_key',
    nullable: true,
  })
  privateKey: string | null

  @Column('varchar', {
    name: 'public_key',
    nullable: true,
  })

  publicKey: string | null

  @Column('varchar', {
    name: 'symmetric_key',
    nullable: true,
  })
  symmetricKey: string | null

  @Column('varchar', {
    name: 'iv_key',
    nullable: true,
  })
  ivKey: string | null

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
