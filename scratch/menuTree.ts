const allRoles = [5, 9, 10, 11, 12, 13, 14, 17, 18, 21, 22, 23, 26, 27, 31, 32];

const menuTree: MenuItem[] = [
  { id: 'knowledge-base', label: 'База знаний', icon: 'BookOpen', path: 'knowledge-base', roles: allRoles },
  { id: 'tests', label: 'Тесты', icon: 'GraduationCap', path: 'tests', roles: allRoles },
  { id: 'my-premie', label: 'Моя премия', icon: 'Award', path: 'my-premie', roles: allRoles },
  { id: 'office-stats', label: 'Статистика моего офиса', icon: 'BarChart2', path: 'office-stats', roles: allRoles },
  { id: 'bank-stats', label: 'Статистика банка', icon: 'PieChart', path: 'bank-stats', roles: allRoles },
  
  {
    id: 'operator', label: 'Оператор', icon: 'UserCircle', roles: allRoles,
    children: [
      { id: 'operator-premies', label: 'Премии', icon: 'Award', path: 'operator-premies', roles: allRoles },
      { id: 'operator-reports', label: 'отчеты', icon: 'FileText', path: 'operator-reports', roles: allRoles },
      { id: 'operator-data', label: 'Данные', icon: 'Database', path: 'operator-data', roles: allRoles },
      { id: 'operator-tests', label: 'Тесты', icon: 'GraduationCap', path: 'operator-tests', roles: allRoles },
      { id: 'operator-manage-kb', label: 'Управление Базой знаний', icon: 'Settings', path: 'operator-manage-kb', roles: allRoles },
    ]
  },
  {
    id: 'card-apps', label: 'Заявки на карты', icon: 'CreditCard', roles: allRoles,
    children: [
      { id: 'card-create', label: 'Карта', icon: 'PlusCircle', path: 'card-create', roles: allRoles },
      { id: 'card-list', label: 'Заявки', icon: 'List', path: 'card-list', roles: allRoles },
    ]
  },
  {
    id: 'bank-products', label: 'Продукты банка', icon: 'Package', roles: allRoles,
    children: [
      { id: 'products-cards', label: 'Карты', icon: 'CreditCard', path: 'products-cards', roles: allRoles },
      { id: 'products-credits', label: 'Кредиты', icon: 'Banknote', path: 'products-credits', roles: allRoles },
      { id: 'products-accounts', label: 'Счета', icon: 'Wallet', path: 'products-accounts', roles: allRoles },
      { id: 'products-deposits', label: 'Депозиты', icon: 'PiggyBank', path: 'products-deposits', roles: allRoles },
      { id: 'products-transfers', label: 'Переводы', icon: 'ArrowRightLeft', path: 'products-transfers', roles: allRoles },
    ]
  },
  {
    id: 'credit-apps', label: 'Заявки на кредиты', icon: 'Banknote', roles: allRoles,
    children: [
      { id: 'credit-create', label: 'Кредит', icon: 'PlusCircle', path: 'credit-create', roles: allRoles },
      { id: 'credit-list', label: 'Заявки', icon: 'List', path: 'credit-list', roles: allRoles },
    ]
  },
  {
    id: 'deposit-apps', label: 'Заявки на депозиты', icon: 'PiggyBank', roles: allRoles,
    children: [
      { id: 'deposit-create', label: 'Депозит', icon: 'PlusCircle', path: 'deposit-create', roles: allRoles },
      { id: 'deposit-list', label: 'Заявки', icon: 'List', path: 'deposit-list', roles: allRoles },
    ]
  },
  {
    id: 'qr-agent', label: 'Агент по QR-ам', icon: 'QrCode', roles: allRoles,
    children: [
      { id: 'qr-transactions', label: 'Транзакции', icon: 'ArrowRightLeft', path: 'qr-transactions', roles: allRoles },
      { id: 'qr-other-bank-create', label: 'QR другого банка выставление', icon: 'PlusSquare', path: 'qr-other-bank-create', roles: allRoles },
      { id: 'qr-other-bank-settings', label: 'QR другого банка настройки', icon: 'Settings', path: 'qr-other-bank-settings', roles: allRoles },
    ]
  },
  {
    id: 'pvn', label: 'Управление ПВН', icon: 'Monitor', roles: allRoles,
    children: [
      { id: 'pvn-transactions', label: 'ПВН транзакции', icon: 'ArrowRightLeft', path: 'pvn-transactions', roles: allRoles },
      { id: 'pvn-settings', label: 'ПВН настройки', icon: 'Settings', path: 'pvn-settings', roles: allRoles },
    ]
  },
  {
    id: 'sms-agent', label: 'Агент по SMS', icon: 'MessageSquare', roles: allRoles,
    children: [
      { id: 'sms-send', label: 'отправка sms', icon: 'Send', path: 'sms-send', roles: allRoles },
    ]
  },
  {
    id: 'transaction-agent', label: 'Агент по транзакциям', icon: 'ArrowRightLeft', roles: allRoles,
    children: [
      { id: 'transaction-update', label: 'Обновление типа транзакции', icon: 'RefreshCw', path: 'transaction-update', roles: allRoles },
      { id: 'terminal-assign', label: 'Назначение терминалов', icon: 'MonitorSmartphone', path: 'terminal-assign', roles: allRoles },
    ]
  },
  {
    id: 'customs-agent', label: 'Агент по таможне', icon: 'Shield', roles: allRoles,
    children: [
      { id: 'customs-pay', label: 'Просмотр/Оплата таможни', icon: 'Eye', path: 'customs-pay', roles: allRoles },
    ]
  },
  {
    id: 'frontovik', label: 'Фронтовик', icon: 'Users', roles: allRoles,
    children: [
      { id: 'abs-search', label: 'Поиск клиентов в АБС', icon: 'Search', path: 'abs-search', roles: allRoles },
    ]
  },
  {
    id: 'processing', label: 'Процессинг', icon: 'Server', roles: allRoles,
    children: [
      { id: 'processing-limits', label: 'Лимиты', icon: 'Sliders', path: 'processing-limits', roles: allRoles },
      { id: 'processing-transactions', label: 'Транзакции', icon: 'ArrowRightLeft', path: 'processing-transactions', roles: allRoles },
    ]
  },
  {
    id: 'processing-search', label: 'Поиск по процессингу', icon: 'Search', roles: allRoles,
    children: [
      { id: 'processing-search-transactions', label: 'Поиск транзакций', icon: 'Search', path: 'processing-search-transactions', roles: allRoles },
    ]
  },
  { id: 'client-documents', label: 'База документов клиентов', icon: 'FolderOpen', path: 'client-documents', roles: allRoles },
  {
    id: 'atm', label: 'Банкоматы', icon: 'HardDrive', roles: allRoles,
    children: [
      { id: 'atm-table', label: 'таблица банкоматов', icon: 'Table', path: 'atm-table', roles: allRoles },
    ]
  },
  {
    id: 'account-statements', label: 'Выписки со счетов', icon: 'FileText', roles: allRoles,
    children: [
      { id: 'view-statements', label: 'Просмотр выписки со счетов', icon: 'Eye', path: 'view-statements', roles: allRoles },
    ]
  },
  {
    id: 'cashback-menu', label: 'Кэшбэк', icon: 'Gift', roles: allRoles,
    children: [
      { id: 'cashback-settings', label: 'Настройки кешбэка', icon: 'Settings', path: 'cashback-settings', roles: allRoles },
      { id: 'cashback-cards', label: 'Кешбэк по картам', icon: 'CreditCard', path: 'cashback-cards', roles: allRoles },
      { id: 'cashback-limits', label: 'Месячные лимиты', icon: 'Calendar', path: 'cashback-limits', roles: allRoles },
      { id: 'cashback-qr', label: 'Кешбэк по QR', icon: 'QrCode', path: 'cashback-qr', roles: allRoles },
    ]
  },
  {
    id: 'payments', label: 'Платежи', icon: 'Wallet', roles: allRoles,
    children: [
      { id: 'payments-list', label: 'Список платежей', icon: 'List', path: 'payments-list', roles: allRoles },
    ]
  },
];
