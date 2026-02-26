import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string; // Display name for UI

  @Column({ nullable: true })
  avatar: string; // Avatar URL or path

  @Column({ default: 'BUYER' })
  role: string;

  @Column({ nullable: true })
  oauthProvider: string;

  @Column({ nullable: true })
  oauthProviderId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
