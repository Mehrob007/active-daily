// ============================================
// PREMIES PORTAL — Core Type Definitions
// ============================================

/** User roles in the banking portal */
export type RoleId =
  | 5   // Директор
  | 9   // Председатель
  | 10  // Агент Карты
  | 11  // Агент Кредиты
  | 12  // Агент Депозиты
  | 13  // Агент QR & Accounts
  | 14  // SMS Сервис
  | 17  // Frontovik (ABS Search)
  | 18  // Frontovik (Limits)
  | 21  // Frontovik (Transactions)
  | 22  // Продукты (Dynamic Catalog)
  | 23  // Cashback
  | 26  // Агент (операции)
  | 27  // Frontovik (Documents)
  | 31  // Admin (System Logs)
  | 32; // Admin (Daily Tasks)

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: RoleId | number;
  roleIds?: number[];
  roleName: string;
  branch: string;
  email?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  v2Token?: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
  autoLogoutTimer: number | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: RoleId;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ============================================
// Application / Product Types
// ============================================

export type ApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'closed' | 'cancelled';

export interface Application {
  id: string;
  type: 'card' | 'credit' | 'deposit';
  status: ApplicationStatus;
  clientId: string;
  clientName: string;
  productName: string;
  amount?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  notes?: string;
}

export interface CardProduct {
  id: string;
  name: string;
  type: 'debit' | 'credit' | 'prepaid';
  brand: 'visa' | 'mastercard' | 'uzcard' | 'humo';
  annualFee: number;
  cashbackPercent: number;
  minBalance?: number;
  isActive: boolean;
}

export interface CreditProduct {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  interestRate: number;
  isActive: boolean;
}

export interface DepositProduct {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  interestRate: number;
  isReplenishable: boolean;
  isActive: boolean;
}

// ============================================
// Transaction Types
// ============================================

export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  description: string;
  createdAt: string;
  accountId?: string;
  counterparty?: string;
}

// ============================================
// Client Types
// ============================================

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  passport: string;
  phone: string;
  email?: string;
  birthDate?: string;
  accounts: ClientAccount[];
  isActive: boolean;
}

export interface ClientAccount {
  id: string;
  number: string;
  type: 'current' | 'savings' | 'card' | 'deposit';
  balance: number;
  currency: string;
  status: 'active' | 'blocked' | 'closed';
}

// ============================================
// Analytics / KPI Types
// ============================================

export interface KPIData {
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalRevenue: number;
  activeClients: number;
  newClients: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
}

export interface DailyTaskStats {
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
}

// ============================================
// Premie (Bonus) Types
// ============================================

export interface PremieRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  kpiScore: number;
  bonusAmount: number;
  deductions: number;
  totalAmount: number;
  status: 'calculated' | 'approved' | 'paid';
}

// ============================================
// System Log Types
// ============================================

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  timestamp: string;
}

// ============================================
// Menu & Navigation
// ============================================

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  roles: RoleId[];
  children?: MenuItem[];
  badge?: string | number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
