import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export enum Role {
  ADMIN = 'ADMIN',
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
