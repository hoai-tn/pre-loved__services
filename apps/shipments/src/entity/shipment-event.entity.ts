import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';

@Entity('shipment_events')
export class ShipmentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  shipment_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrier_status: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  internal_status: string;

  @Column({ type: 'json', nullable: true })
  raw_payload: any;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @ManyToOne(() => Shipment, shipment => shipment.events)
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;
}
