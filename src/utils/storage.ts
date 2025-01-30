import { User } from '../types';

// Storage keys
const STORAGE_KEYS = {
  USER: 'auth_user',
  USERS: 'users',
  ASSETS: 'assets',
  TICKETS: 'tickets',
  VENDORS: 'vendors',
  PROCUREMENT_REQUESTS: 'procurement_requests'
} as const;

// Default users data
const defaultUsers: User[] = [
  {
    id: '1',
    auth_id: '1',
    email: 'head@example.com',
    name: 'Head User',
    role: 'head',
    department: 'Management',
    position: 'Department Head',
    status: 'active',
    permissions: ['admin', 'manage_users'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    auth_id: '2',
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'manager',
    department: 'IT',
    position: 'IT Manager',
    status: 'active',
    permissions: ['manage_assets', 'manage_tickets'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    auth_id: '3',
    email: 'normal@example.com',
    name: 'Normal User',
    role: 'normal',
    department: 'Support',
    position: 'Support Specialist',
    status: 'active',
    permissions: ['create_tickets', 'view_assets'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    auth_id: '4',
    email: 'view@example.com',
    name: 'View User',
    role: 'view',
    department: 'Operations',
    position: 'Operations Analyst',
    status: 'active',
    permissions: ['view_only'],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initialize storage with default data if empty
export function initializeStorage() {
  try {
    // Initialize users if not present
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    // Initialize other storage items if needed
    const emptyCollections = [
      STORAGE_KEYS.ASSETS,
      STORAGE_KEYS.TICKETS,
      STORAGE_KEYS.VENDORS,
      STORAGE_KEYS.PROCUREMENT_REQUESTS
    ];

    emptyCollections.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// User related storage functions
export function getStoredUsers(): User[] {
  try {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : defaultUsers;
  } catch (error) {
    console.error('Error getting stored users:', error);
    return defaultUsers;
  }
}

export function getStoredUser(): User | null {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
}

export function setStoredUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (error) {
    console.error('Error setting stored user:', error);
  }
}

// Initialize storage when imported
initializeStorage();