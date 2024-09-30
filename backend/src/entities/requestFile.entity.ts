import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm'

export enum RequestFileStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,

}
@Entity('request_file', { schema: 'users' })
export class RequestFile {
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
    name: 'owner_id',
  })
  ownerId: string | null

  @Column('uuid', {
    name: 'requester_id',
  })
  requesterId: string | null

  @Column( {
    type: 'int',
    name: 'status',
    default: RequestFileStatus.PENDING
  })
  status: number

  @Column('uuid', {
    name: 'file_id',
  })
  fileId: string | null

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp without time zone", name: "updated_at" })
  updatedAt!: Date;
}
