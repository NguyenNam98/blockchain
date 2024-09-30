import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'
@Entity('file', { schema: 'users' })
export class File {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: 'boolean',
    name: 'is_valid',
    width: 1,
    default: () => true,
  })
  isValid: boolean


  @Column('uuid', {
    name: 'user_id',
  })
  userId: string | null

  @Column('varchar', {
    name: 'file_name',
    nullable: true,
    length: 64,
  })
  fileName: string | null

  @Column('varchar', {
    name: 'file_key',
    nullable: true,
    length: 64,
  })
  fileKey: string | null

  @Column('varchar', {
    name: 'mine_type',
    nullable: true,
    length: 64,
  })
  mineType: string | null


  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}

