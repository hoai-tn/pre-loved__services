import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('shipping_providers')
export class ShippingProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'boolean', default: true })
  supports_cod: boolean;

  @Column({ type: 'boolean', default: true })
  supports_tracking: boolean;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
