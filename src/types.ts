// User-related types
export type UserRole = 'head' | 'manager' | 'normal' | 'view';
export type UserStatus = 'active' | 'inactive' | 'locked';

export interface User {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  position?: string;
  status: UserStatus;
  last_login?: string;
  permissions: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}