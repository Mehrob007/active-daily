import type { MenuItem, RoleId } from "@/types";

const allRoles = [5, 9, 10, 11, 12, 13, 14, 17, 18, 21, 22, 23, 26, 27, 31, 32];

const menuTree: MenuItem[] = [
  {
    id: "dashboard",
    label: "Главная",
    icon: "LayoutDashboard",
    path: "dashboard",
    roles: allRoles,
  },
  {
    id: "knowledge-base",
    label: "База знаний",
    icon: "BookOpen",
    path: "knowledge-base",
    roles: allRoles,
  },
  {
    id: "tests",
    label: "Тесты",
    icon: "GraduationCap",
    path: "tests",
    roles: allRoles,
  },
  {
    id: "my-premie",
    label: "Моя премия",
    icon: "Award",
    path: "my-premie",
    roles: allRoles,
  },
  {
    id: "office-stats",
    label: "Статистика моего офиса",
    icon: "BarChart2",
    path: "office-stats",
    roles: allRoles,
  },
  {
    id: "bank-stats",
    label: "Статистика банка",
    icon: "PieChart",
    path: "bank-stats",
    roles: allRoles,
  },

  {
    id: "operator",
    label: "Оператор",
    icon: "UserCircle",
    roles: allRoles,
    children: [
      {
        id: "operator-premies",
        label: "Премии",
        icon: "Award",
        path: "operator-premies",
        roles: allRoles,
      },
      {
        id: "operator-reports",
        label: "отчеты",
        icon: "FileText",
        path: "operator-reports",
        roles: allRoles,
      },
      {
        id: "operator-data",
        label: "Данные",
        icon: "Database",
        path: "operator-data",
        roles: allRoles,
      },
      {
        id: "operator-tests",
        label: "Тесты",
        icon: "GraduationCap",
        path: "operator-tests",
        roles: allRoles,
      },
      {
        id: "operator-manage-kb",
        label: "Управление Базой знаний",
        icon: "Settings",
        path: "operator-manage-kb",
        roles: allRoles,
      },
    ],
  },
  {
    id: "card-apps",
    label: "Заявки на карты",
    icon: "CreditCard",
    roles: allRoles,
    children: [
      {
        id: "card-create",
        label: "Карта",
        icon: "PlusCircle",
        path: "card-apps/create",
        roles: allRoles,
      },
      {
        id: "card-list",
        label: "Заявки",
        icon: "List",
        path: "card-apps/list",
        roles: allRoles,
      },
    ],
  },
  {
    id: "bank-products",
    label: "Продукты банка",
    icon: "Package",
    roles: allRoles,
    children: [
      {
        id: "products-cards",
        label: "Карты",
        icon: "CreditCard",
        path: "products/cards",
        roles: allRoles,
      },
      {
        id: "products-credits",
        label: "Кредиты",
        icon: "Banknote",
        path: "products/credits",
        roles: allRoles,
      },
      {
        id: "products-accounts",
        label: "Счета",
        icon: "Wallet",
        path: "products/accounts",
        roles: allRoles,
      },
      {
        id: "products-deposits",
        label: "Депозиты",
        icon: "PiggyBank",
        path: "products/deposits",
        roles: allRoles,
      },
      {
        id: "products-transfers",
        label: "Переводы",
        icon: "ArrowRightLeft",
        path: "products/transfers",
        roles: allRoles,
      },
    ],
  },
  {
    id: "credit-apps",
    label: "Заявки на кредиты",
    icon: "Banknote",
    roles: allRoles,
    children: [
      {
        id: "credit-create",
        label: "Кредит",
        icon: "PlusCircle",
        path: "credit-apps/create",
        roles: allRoles,
      },
      {
        id: "credit-list",
        label: "Заявки",
        icon: "List",
        path: "credit-apps/list",
        roles: allRoles,
      },
    ],
  },
  {
    id: "deposit-apps",
    label: "Заявки на депозиты",
    icon: "PiggyBank",
    roles: allRoles,
    children: [
      {
        id: "deposit-create",
        label: "Депозит",
        icon: "PlusCircle",
        path: "deposit-apps/create",
        roles: allRoles,
      },
      {
        id: "deposit-list",
        label: "Заявки",
        icon: "List",
        path: "deposit-apps/list",
        roles: allRoles,
      },
    ],
  },
  {
    id: "qr-agent",
    label: "Агент по QR-ам",
    icon: "QrCode",
    roles: allRoles,
    children: [
      {
        id: "qr-transactions",
        label: "Транзакции",
        icon: "ArrowRightLeft",
        path: "qr-transactions",
        roles: allRoles,
      },
      {
        id: "qr-other-bank-create",
        label: "QR другого банка выставление",
        icon: "PlusSquare",
        path: "qr-other-bank-create",
        roles: allRoles,
      },
      {
        id: "qr-other-bank-settings",
        label: "QR другого банка настройки",
        icon: "Settings",
        path: "qr-other-bank-settings",
        roles: allRoles,
      },
    ],
  },
  {
    id: "pvn",
    label: "Управление ПВН",
    icon: "Monitor",
    roles: allRoles,
    children: [
      {
        id: "pvn-transactions",
        label: "ПВН транзакции",
        icon: "ArrowRightLeft",
        path: "pvn-transactions",
        roles: allRoles,
      },
      {
        id: "pvn-settings",
        label: "ПВН настройки",
        icon: "Settings",
        path: "pvn-settings",
        roles: allRoles,
      },
    ],
  },
  {
    id: "sms-agent",
    label: "Агент по SMS",
    icon: "MessageSquare",
    roles: allRoles,
    children: [
      {
        id: "sms-send",
        label: "отправка sms",
        icon: "Send",
        path: "sms-send",
        roles: allRoles,
      },
    ],
  },
  {
    id: "transaction-agent",
    label: "Агент по транзакциям",
    icon: "ArrowRightLeft",
    roles: allRoles,
    children: [
      {
        id: "transaction-update",
        label: "Обновление типа транзакции",
        icon: "RefreshCw",
        path: "transaction-update",
        roles: allRoles,
      },
      {
        id: "terminal-assign",
        label: "Назначение терминалов",
        icon: "MonitorSmartphone",
        path: "terminal-assign",
        roles: allRoles,
      },
    ],
  },
  {
    id: "customs-agent",
    label: "Агент по таможне",
    icon: "Shield",
    roles: allRoles,
    children: [
      {
        id: "customs-pay",
        label: "Просмотр/Оплата таможни",
        icon: "Eye",
        path: "customs-pay",
        roles: allRoles,
      },
    ],
  },
  {
    id: "frontovik",
    label: "Фронтовик",
    icon: "Users",
    roles: allRoles,
    children: [
      {
        id: "abs-search",
        label: "Поиск клиентов в АБС",
        icon: "Search",
        path: "abs-search",
        roles: allRoles,
      },
    ],
  },
  {
    id: "processing",
    label: "Процессинг",
    icon: "Cpu",
    roles: allRoles,
    children: [
      {
        id: "processing-limits",
        label: "Лимиты",
        icon: "ShieldAlert",
        path: "processing-limits",
        roles: allRoles,
      },
      {
        id: "processing-transactions",
        label: "Транзакции",
        icon: "ArrowRightLeft",
        path: "processing-transactions",
        roles: allRoles,
      },
    ],
  },
  {
    id: "processing-search",
    label: "Поиск по процессингу",
    icon: "Search",
    roles: allRoles,
    children: [
      {
        id: "processing-search-transactions",
        label: "Поиск транзакций",
        icon: "Search",
        path: "processing-search-transactions",
        roles: allRoles,
      },
    ],
  },
  {
    id: "client-documents",
    label: "База документов клиентов",
    icon: "FolderOpen",
    path: "client-documents",
    roles: allRoles,
  },
  {
    id: "atm",
    label: "Банкоматы",
    icon: "HardDrive",
    roles: allRoles,
    children: [
      {
        id: "atm-table",
        label: "таблица банкоматов",
        icon: "Table",
        path: "atm-table",
        roles: allRoles,
      },
    ],
  },
  {
    id: "account-statements",
    label: "Выписки со счетов",
    icon: "FileText",
    roles: allRoles,
    children: [
      {
        id: "view-statements",
        label: "Просмотр выписки со счетов",
        icon: "Eye",
        path: "view-statements",
        roles: allRoles,
      },
    ],
  },
  {
    id: "cashback-menu",
    label: "Кэшбэк",
    icon: "Gift",
    roles: allRoles,
    children: [
      {
        id: "cashback-settings",
        label: "Настройки кешбэка",
        icon: "Settings",
        path: "cashback-settings",
        roles: allRoles,
      },
      {
        id: "cashback-cards",
        label: "Кешбэк по картам",
        icon: "CreditCard",
        path: "cashback-cards",
        roles: allRoles,
      },
      {
        id: "cashback-limits",
        label: "Месячные лимиты",
        icon: "Calendar",
        path: "cashback-limits",
        roles: allRoles,
      },
      {
        id: "cashback-qr",
        label: "Кешбэк по QR",
        icon: "QrCode",
        path: "cashback-qr",
        roles: allRoles,
      },
    ],
  },
  {
    id: "payments",
    label: "Платежи",
    icon: "Wallet",
    roles: allRoles,
    children: [
      {
        id: "payments-list",
        label: "Список платежей",
        icon: "List",
        path: "payments-list",
        roles: allRoles,
      },
    ],
  },
];

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

export function getFilteredMenu(roleIds: number[]): MenuItem[] {
  return filterMenuItems(menuTree, roleIds);
}

export function getBreadcrumbsForPath(
  pageId: string,
): { label: string; path?: string }[] {
  const crumbs: { label: string; path?: string }[] = [
    { label: "Active Daily" },
  ];

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

export function getPathFromPageId(id: string): string {
  switch (id) {
    case "dashboard":
      return "/";
    case "knowledge-base":
      return "/knowledge-base";
    case "tests":
      return "/tests";
    case "my-premie":
      return "/my-premie";
    case "office-stats":
      return "/office-stats";
    case "bank-stats":
      return "/bank-stats";

    case "operator-premies":
      return "/operator/premies";
    case "operator-reports":
      return "/operator/reports";
    case "operator-data":
      return "/operator/data";
    case "operator-tests":
      return "/operator/tests";
    case "operator-manage-kb":
      return "/operator/manage-kb";

    case "card-create":
      return "/card-apps/create";
    case "card-list":
      return "/card-apps/list";

    case "products-cards":
      return "/products/cards";
    case "products-credits":
      return "/products/credits";
    case "products-accounts":
      return "/products/accounts";
    case "products-deposits":
      return "/products/deposits";
    case "products-transfers":
      return "/products/transfers";

    case "credit-create":
      return "/credit-apps/create";
    case "credit-list":
      return "/credit-apps/list";

    case "deposit-create":
      return "/deposit-apps/create";
    case "deposit-list":
      return "/deposit-apps/list";

    case "qr-transactions":
      return "/agent-qr/transactions/list";
    case "qr-other-bank-create":
      return "/accounts-qr/operations";
    case "qr-other-bank-settings":
      return "/accounts-qr/settings";

    case "pvn-transactions":
      return "/pvn/transactions";
    case "pvn-settings":
      return "/pvn/settings";

    case "sms-send":
      return "/sms-agent/send";

    case "transaction-update":
      return "/transaction-agent/update";
    case "terminal-assign":
      return "/transaction-agent/terminal-assign";

    case "customs-pay":
      return "/customs-agent/pay";

    case "abs-search":
      return "/frontovik/abs-search";

    case "processing-limits":
      return "/processing/limits";
    case "processing-transactions":
      return "/processing/transactions";
    case "limits":
      return "/processing/limits";
    case "transactions":
      return "/processing/transactions";

    case "processing-search-transactions":
      return "/processing-search/transactions";

    case "client-documents":
      return "/client-documents";
    case "documents":
      return "/client-documents";

    case "atm-table":
      return "/atm/table";

    case "view-statements":
      return "/account-statements/view";

    case "cashback-settings":
      return "/cashback/settings";
    case "cashback-cards":
      return "/cashback/cards";
    case "cashback-limits":
      return "/cashback/limits";
    case "cashback-qr":
      return "/cashback/qr";

    case "payments-list":
      return "/payments/list";

    default:
      return "/";
  }
}

export function getPageIdFromPath(pathname: string): string {
  const p = pathname.replace(/\/$/, ""); 
  if (p === "" || p === "/dashboard") return "dashboard";
  if (p === "/knowledge-base") return "knowledge-base";
  if (p === "/tests") return "tests";
  if (p === "/my-premie") return "my-premie";
  if (p === "/office-stats") return "office-stats";
  if (p === "/bank-stats") return "bank-stats";

  if (p === "/operator/premies") return "operator-premies";
  if (p === "/operator/reports") return "operator-reports";
  if (p === "/operator/data") return "operator-data";
  if (p === "/operator/tests") return "operator-tests";
  if (p === "/operator/manage-kb") return "operator-manage-kb";

  if (p === "/card-apps/create") return "card-create";
  if (p === "/card-apps/list") return "card-list";

  if (p === "/products/cards") return "products-cards";
  if (p === "/products/credits") return "products-credits";
  if (p === "/products/accounts") return "products-accounts";
  if (p === "/products/deposits") return "products-deposits";
  if (p === "/products/transfers") return "products-transfers";

  if (p === "/credit-apps/create") return "credit-create";
  if (p === "/credit-apps/list") return "credit-list";

  if (p === "/deposit-apps/create") return "deposit-create";
  if (p === "/deposit-apps/list") return "deposit-list";

  if (p === "/agent-qr/transactions/list") return "qr-transactions";
  if (p === "/accounts-qr/operations") return "qr-other-bank-create";
  if (p === "/accounts-qr/settings") return "qr-other-bank-settings";

  if (p === "/pvn/transactions") return "pvn-transactions";
  if (p === "/pvn/settings") return "pvn-settings";

  if (p === "/sms-agent/send") return "sms-send";

  if (p === "/transaction-agent/update") return "transaction-update";
  if (p === "/transaction-agent/terminal-assign") return "terminal-assign";

  if (p === "/customs-agent/pay") return "customs-pay";

  if (p === "/frontovik/abs-search") return "abs-search";

  if (p === "/processing/limits") return "limits";
  if (p === "/processing/transactions") return "transactions";

  if (p === "/processing-search/transactions")
    return "processing-search-transactions";

  if (p === "/client-documents") return "documents";

  if (p === "/atm/table") return "atm-table";

  if (p === "/account-statements/view") return "view-statements";

  if (p === "/cashback/settings") return "cashback-settings";
  if (p === "/cashback/cards") return "cashback-cards";
  if (p === "/cashback/limits") return "cashback-limits";
  if (p === "/cashback/qr") return "cashback-qr";

  if (p === "/payments/list") return "payments-list";

  return "dashboard";
}
