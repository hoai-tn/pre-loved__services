import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ShipmentEvent } from './shipment-event.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  order_id: string;

  @Column({ type: 'varchar', length: 10 })
  carrier: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrier_order_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tracking_code: string;

  @Column({ type: 'varchar', length: 30, default: 'CREATED' })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  shipping_fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cod_amount: number;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @OneToMany(() => ShipmentEvent, event => event.shipment, { cascade: true })
  events: ShipmentEvent[];
}
