import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  walletSets?: Record<string, string[]>;
}

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

// Read all users
function readUsers(): User[] {
  ensureDataDir();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write all users
function writeUsers(users: User[]): void {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = readUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const users = readUsers();
  return users.find(u => u.id === id) || null;
}

// Create new user
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const users = readUsers();

  const newUser: User = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    email: data.email,
    password: data.password,
    name: data.name,
    createdAt: new Date().toISOString(),
    walletSets: {},
  };

  users.push(newUser);
  writeUsers(users);

  return newUser;
}

// Update user
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = readUsers();
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return null;
  }

  users[index] = { ...users[index], ...updates };
  writeUsers(users);

  return users[index];
}

// Save wallet set for user
export async function saveUserWalletSet(
  userId: string,
  setName: string,
  wallets: string[]
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) {
    return false;
  }

  const walletSets = user.walletSets || {};
  walletSets[setName] = wallets;

  await updateUser(userId, { walletSets });
  return true;
}

// Get user's wallet sets
export async function getUserWalletSets(userId: string): Promise<Record<string, string[]>> {
  const user = await getUserById(userId);
  return user?.walletSets || {};
}

// Delete wallet set for user
export async function deleteUserWalletSet(
  userId: string,
  setName: string
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user || !user.walletSets) {
    return false;
  }

  delete user.walletSets[setName];
  await updateUser(userId, { walletSets: user.walletSets });
  return true;
}
