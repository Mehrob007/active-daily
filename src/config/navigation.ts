import type { MenuItem, RoleId } from '@/types';

// ─── Full menu tree ────────────────────────────────────────────
const menuTree: MenuItem[] = [
  // ── Dashboard ─────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Панель управления',
    icon: 'LayoutDashboard',
    path: 'dashboard',
    roles: [5, 9, 10, 11, 12, 13, 14, 17, 18, 21, 22, 23, 26, 27, 31, 32],
  },
  // ── Agent Operations ──────────────────────────────────────
  {
    id: 'agent-ops',
    label: 'Операции агентов',
    icon: 'Users',
    roles: [5, 9, 10, 11, 12, 13, 14, 23, 26],
    children: [
      {
        id: 'applications',
        label: 'Заявки',
        icon: 'FileText',
        path: 'applications',
        roles: [5, 9, 10, 11, 12],
      },
      {
        id: 'cards-deposits',
        label: 'Карты и депозиты',
        icon: 'CreditCard',
        path: 'cards-deposits',
        roles: [5, 9, 10, 12],
      },
      {
        id: 'credits',
        label: 'Кредитование',
        icon: 'Banknote',
        path: 'credits',
        roles: [5, 9, 11],
      },
      {
        id: 'qr-accounts',
        label: 'QR и счета',
        icon: 'QrCode',
        path: 'qr-accounts',
        roles: [5, 9, 13, 26],
      },
      {
        id: 'sms-service',
        label: 'SMS-сервис',
        icon: 'MessageSquare',
        path: 'sms-service',
        roles: [5, 9, 14],
      },
      {
        id: 'cashback',
        label: 'Кэшбэк',
        icon: 'Gift',
        path: 'cashback',
        roles: [5, 9, 23],
      },
    ],
  },
  // ── Back-office ───────────────────────────────────────────
  {
    id: 'back-office',
    label: 'Бэк-офис',
    icon: 'Building',
    roles: [5, 9, 31],
    children: [
      {
        id: 'premies',
        label: 'Премии',
        icon: 'Calculator',
        path: 'premies',
        roles: [5, 9],
      },
      {
        id: 'tests',
        label: 'Тестирование',
        icon: 'GraduationCap',
        path: 'tests',
        roles: [5, 9, 31],
      },
      {
        id: 'reports',
        label: 'Отчётность',
        icon: 'FileBarChart',
        path: 'reports',
        roles: [5, 9],
      },
      {
        id: 'data-journal',
        label: 'Журнал данных',
        icon: 'ScrollText',
        path: 'data-journal',
        roles: [5, 9, 31],
      },
    ],
  },
  // ── Processing / Technical ────────────────────────────────
  {
    id: 'processing',
    label: 'Процессинг',
    icon: 'Server',
    roles: [5, 9, 17, 18, 21, 27],
    children: [
      {
        id: 'abs-search',
        label: 'ABS поиск',
        icon: 'Search',
        path: 'abs-search',
        roles: [5, 9, 17],
      },
      {
        id: 'limits',
        label: 'Лимиты',
        icon: 'Shield',
        path: 'limits',
        roles: [5, 9, 18],
      },
      {
        id: 'transactions',
        label: 'Транзакции',
        icon: 'ArrowLeftRight',
        path: 'transactions',
        roles: [5, 9, 21],
      },
      {
        id: 'documents',
        label: 'Документы',
        icon: 'FolderOpen',
        path: 'documents',
        roles: [5, 9, 27],
      },
    ],
  },
  // ── Products ──────────────────────────────────────────────
  {
    id: 'products',
    label: 'Продукты',
    icon: 'Package',
    path: 'products',
    roles: [5, 9, 22],
  },
  // ── Analytics / Management ────────────────────────────────
  {
    id: 'analytics',
    label: 'Аналитика',
    icon: 'BarChart3',
    roles: [5, 9, 31, 32],
    children: [
      {
        id: 'chairman-reports',
        label: 'Отчёты председателя',
        icon: 'BarChart3',
        path: 'chairman-reports',
        roles: [5, 9],
      },
      {
        id: 'director-reports',
        label: 'Отчёты директора',
        icon: 'TrendingUp',
        path: 'director-reports',
        roles: [5, 9],
      },
      {
        id: 'system-logs',
        label: 'Системные логи',
        icon: 'Activity',
        path: 'system-logs',
        roles: [5, 9, 31],
      },
      {
        id: 'daily-tasks',
        label: 'Ежедневные задачи',
        icon: 'ClipboardCheck',
        path: 'daily-tasks',
        roles: [5, 9, 32],
      },
    ],
  },
];

// ─── Filter helpers ────────────────────────────────────────────
function filterMenuItems(items: MenuItem[], roleIds: number[]): MenuItem[] {
  const result: MenuItem[] = [];

  for (const item of items) {
    if (!item.roles.some((r) => roleIds.includes(r))) continue;

    if (item.children) {
      const filteredChildren = filterMenuItems(item.children, roleIds);
      if (filteredChildren.length > 0) {
        result.push({ ...item, children: filteredChildren });
      }
    } else {
      result.push(item);
    }
  }

  return result;
}

// ─── Public API ────────────────────────────────────────────────
export function getFilteredMenu(roleIds: number[]): MenuItem[] {
  return filterMenuItems(menuTree, roleIds);
}

/** Get breadcrumbs for a page: [group, page] */
export function getBreadcrumbsForPath(pageId: string): { label: string; path?: string }[] {
  const crumbs: { label: string; path?: string }[] = [{ label: 'Premies Portal' }];

  for (const group of menuTree) {
    if (group.id === pageId) {
      crumbs.push({ label: group.label });
      return crumbs;
    }
    if (group.children) {
      for (const child of group.children) {
        if (child.id === pageId) {
          crumbs.push({ label: group.label });
          crumbs.push({ label: child.label });
          return crumbs;
        }
      }
    }
  }

  crumbs.push({ label: pageId });
  return crumbs;
}

/** Get a flat list of all visible page IDs for quick lookup */
export function getAllowedPages(roleIds: number[]): string[] {
  const flat: string[] = [];
  const walk = (items: MenuItem[]) => {
    for (const item of items) {
      if (item.children) {
        walk(item.children);
      } else if (item.path) {
        flat.push(item.id);
      }
    }
  };
  walk(getFilteredMenu(roleIds));
  return flat;
}
