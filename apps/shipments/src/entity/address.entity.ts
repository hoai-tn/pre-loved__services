import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  province: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ward: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  detail: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  full_text: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
