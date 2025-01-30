// Default users for the system
export const defaultUsers = [
  {
    email: 'head@example.com',
    password: 'password123',
    name: 'Head User',
    role: 'head',
    department: 'Management',
    position: 'Department Head'
  },
  {
    email: 'manager@example.com',
    password: 'password123', 
    name: 'Manager User',
    role: 'manager',
    department: 'IT',
    position: 'IT Manager'
  },
  {
    email: 'normal@example.com',
    password: 'password123',
    name: 'Normal User', 
    role: 'normal',
    department: 'Support',
    position: 'Support Specialist'
  },
  {
    email: 'view@example.com',
    password: 'password123',
    name: 'View User',
    role: 'view',
    department: 'Operations', 
    position: 'Operations Analyst'
  }
] as const;