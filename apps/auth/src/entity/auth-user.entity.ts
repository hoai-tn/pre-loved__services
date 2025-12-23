import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class AuthUser {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true, name: 'user_id' })
  userId: number;

  @Column({ unique: true, name: 'username' })
  username: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ unique: true, name: 'email' })
  email: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: 0, name: 'failed_login_attempts' })
  failedLoginAttempts: number;

  @Column({
    nullable: true,
    name: 'last_successful_login_at',
    type: 'timestamp',
  })
  lastSuccessfulLoginAt: Date;

  @Column({ nullable: true, name: 'last_failed_login_at' })
  lastFailedLoginAt: Date;

  @Column({
    nullable: true,
    name: 'last_login_ip',
    type: 'varchar',
    length: 255,
  })
  lastLoginIp: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
