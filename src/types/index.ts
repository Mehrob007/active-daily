
export type RoleId =
  | 5 
  | 9 
  | 10 
  | 11 
  | 12 
  | 13 
  | 14 
  | 17 
  | 18 
  | 21 
  | 22 
  | 23 
  | 26 
  | 27 
  | 31 
  | 32
  | 33;

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

export type ApplicationStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "closed"
  | "cancelled";

export interface Application {
  id: string;
  type: "card" | "credit" | "deposit";
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
  type: "debit" | "credit" | "prepaid";
  brand: "visa" | "mastercard" | "uzcard" | "humo";
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

export interface Transaction {
  id: string;
  type: "credit" | "debit" | "transfer";
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "reversed";
  description: string;
  createdAt: string;
  accountId?: string;
  counterparty?: string;
}

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
  type: "current" | "savings" | "card" | "deposit";
  balance: number;
  currency: string;
  status: "active" | "blocked" | "closed";
}

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

export interface PremieRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  kpiScore: number;
  bonusAmount: number;
  deductions: number;
  totalAmount: number;
  status: "calculated" | "approved" | "paid";
}

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
