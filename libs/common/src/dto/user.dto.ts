export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  name?: string; // Display name for UI
  avatar?: string; // Avatar URL or path
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
