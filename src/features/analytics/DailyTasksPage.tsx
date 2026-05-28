'use client';

import React, { useState, useMemo } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  Clock,
  Circle,
  AlertTriangle,
  CalendarDays,
  Filter,
  User,
  ArrowRightLeft,
  Timer,
  BarChart3,
  ListChecks,
  CircleDot,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskStatus = 'completed' | 'in_progress' | 'pending' | 'overdue';
type TaskPriority = 'high' | 'medium' | 'low';

interface Task {
  id: string;
  name: string;
  assignee: string;
  dueTime: string;
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  category: string;
}

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.ElementType;
    border: string;
  }
> = {
  completed: {
    label: 'Выполнено',
    color: 'text-bank-success',
    bg: 'bg-bank-success/10',
    icon: CheckCircle2,
    border: 'border-bank-success/20',
  },
  in_progress: {
    label: 'В процессе',
    color: 'text-bank-warning',
    bg: 'bg-bank-warning/10',
    icon: Clock,
    border: 'border-bank-warning/20',
  },
  pending: {
    label: 'В ожидании',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    icon: Circle,
    border: 'border-border/60',
  },
  overdue: {
    label: 'Просрочено',
    color: 'text-bank-red',
    bg: 'bg-bank-red/10',
    icon: AlertTriangle,
    border: 'border-bank-red/20',
  },
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; dot: string; bg: string }
> = {
  high: { label: 'Высокий', dot: 'bg-bank-red', bg: 'bg-bank-red/10 text-bank-red border-bank-red/20' },
  medium: { label: 'Средний', dot: 'bg-bank-warning', bg: 'bg-bank-warning/10 text-bank-warning border-bank-warning/20' },
  low: { label: 'Низкий', dot: 'bg-muted-foreground', bg: 'bg-muted text-muted-foreground border-border/60' },
};

const mockTasks: Task[] = [
  {
    id: 'T-001',
    name: 'Реконсиляция по счёту 1020',
    assignee: 'Каримов А.Р.',
    dueTime: '09:00',
    status: 'completed',
    priority: 'high',
    description: 'Ежедневная сверка корр. счёта с выпиской',
    category: 'Операции',
  },
  {
    id: 'T-002',
    name: 'Формирование отчёта НБРК',
    assignee: 'Рахимова Д.У.',
    dueTime: '10:00',
    status: 'completed',
    priority: 'high',
    description: 'Сформировать и отправить рег. отчёт в ЦБ',
    category: 'Отчётность',
  },
  {
    id: 'T-003',
    name: 'Верификация клиентов (партия 45)',
    assignee: 'Мирзаев Б.Т.',
    dueTime: '11:30',
    status: 'completed',
    priority: 'medium',
    description: 'Проверка KYC документов по новой партии',
    category: 'Клиенты',
  },
  {
    id: 'T-004',
    name: 'Ревизия кредитного портфеля',
    assignee: 'Турсунов Ж.К.',
    dueTime: '12:00',
    status: 'completed',
    priority: 'high',
    description: 'Проверка просроченной задолженности',
    category: 'Кредиты',
  },
  {
    id: 'T-005',
    name: 'Обработка карточных заявок',
    assignee: 'Сидорова Н.А.',
    dueTime: '14:00',
    status: 'in_progress',
    priority: 'medium',
    description: 'Рассмотрение 12 новых заявок на карты',
    category: 'Карты',
  },
  {
    id: 'T-006',
    name: 'Связка с платёжной системой',
    assignee: 'Ахметов С.Б.',
    dueTime: '15:00',
    status: 'in_progress',
    priority: 'high',
    description: 'Интеграция нового шлюза UzCard',
    category: 'Технологии',
  },
  {
    id: 'T-007',
    name: 'Аудит транзакций за месяц',
    assignee: 'Исаева Г.Х.',
    dueTime: '16:00',
    status: 'in_progress',
    priority: 'medium',
    description: 'Проверка аномальных транзакций',
    category: 'Безопасность',
  },
  {
    id: 'T-008',
    name: 'Обновление тарифов по депозитам',
    assignee: 'Умарова З.М.',
    dueTime: '17:00',
    status: 'in_progress',
    priority: 'low',
    description: 'Актуализация ставок в системе',
    category: 'Продукты',
  },
  {
    id: 'T-009',
    name: 'Генерация выписок клиентам',
    assignee: 'Каримов А.Р.',
    dueTime: '10:00',
    status: 'pending',
    priority: 'medium',
    description: 'Формирование ежемесячных выписок',
    category: 'Операции',
  },
  {
    id: 'T-010',
    name: 'Проверка лимитов по картам',
    assignee: 'Рахимова Д.У.',
    dueTime: '11:00',
    status: 'pending',
    priority: 'low',
    description: 'Пересмотр лимитов VIP-клиентов',
    category: 'Карты',
  },
  {
    id: 'T-011',
    name: 'Подготовка презентации для совета',
    assignee: 'Мирзаев Б.Т.',
    dueTime: '13:00',
    status: 'pending',
    priority: 'medium',
    description: 'Слайды с квартальными результатами',
    category: 'Отчётность',
  },
  {
    id: 'T-012',
    name: 'Обработка депозитных заявок',
    assignee: 'Турсунов Ж.К.',
    dueTime: '09:30',
    status: 'overdue',
    priority: 'high',
    description: '8 заявок на открытие депозитов',
    category: 'Депозиты',
  },
  {
    id: 'T-013',
    name: 'Закрытие опер. дня',
    assignee: 'Сидорова Н.А.',
    dueTime: '18:00',
    status: 'overdue',
    priority: 'high',
    description: 'Формирование баланса и закрытие дня',
    category: 'Операции',
  },
  {
    id: 'T-014',
    name: 'Обновление кэшбэк-программы',
    assignee: 'Ахметов С.Б.',
    dueTime: '12:00',
    status: 'overdue',
    priority: 'medium',
    description: 'Настройка новых партнёров кэшбэка',
    category: 'Продукты',
  },
  {
    id: 'T-015',
    name: 'Мониторинг AML-сигналов',
    assignee: 'Исаева Г.Х.',
    dueTime: '08:00',
    status: 'overdue',
    priority: 'high',
    description: 'Рассмотрение 5 подозрительных транзакций',
    category: 'Безопасность',
  },
];

const assignees = [
  'Все сотрудники',
  ...Array.from(new Set(mockTasks.map((t) => t.assignee))),
];

function TaskCard({
  task,
  onComplete,
  onReassign,
}: {
  task: Task;
  onComplete: (id: string) => void;
  onReassign: (id: string) => void;
}) {
  const statusConf = STATUS_CONFIG[task.status];
  const priorityConf = PRIORITY_CONFIG[task.priority];
  const StatusIcon = statusConf.icon;

  return (
    <div
      className={cn(
        'group rounded-lg border p-4 transition-all hover:shadow-md',
        task.status === 'completed' && 'border-bank-success/20 bg-bank-success/5',
        task.status === 'in_progress' && 'border-bank-warning/20 bg-bank-warning/5',
        task.status === 'pending' && 'border-border/60 bg-white',
        task.status === 'overdue' && 'border-bank-red/20 bg-bank-red/5',
      )}
    >
      {}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">
            {task.id}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={cn('size-1.5 rounded-full', priorityConf.dot)} />
            <span
              className={cn(
                'text-[11px] font-medium px-1.5 py-0.5 rounded border',
                priorityConf.bg,
              )}
            >
              {priorityConf.label}
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-[11px] font-medium gap-1',
            statusConf.bg,
            statusConf.color,
            statusConf.border,
          )}
        >
          <StatusIcon className="size-3" />
          {statusConf.label}
        </Badge>
      </div>

      {}
      <h4
        className={cn(
          'text-sm font-semibold mb-1',
          task.status === 'completed' && 'line-through text-muted-foreground',
          task.status !== 'completed' && 'text-foreground',
        )}
      >
        {task.name}
      </h4>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {task.description}
      </p>

      {}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="size-3" />
            <span>{task.assignee}</span>
          </div>
          <div className="flex items-center gap-1">
            <Timer className="size-3" />
            <span>{task.dueTime}</span>
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {task.category}
          </Badge>
        </div>

        {}
        {task.status !== 'completed' && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-[11px] text-bank-success hover:text-bank-success hover:bg-bank-success/10"
              onClick={() => onComplete(task.id)}
            >
              <CheckCircle2 className="size-3.5" />
              Готово
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-[11px] text-bank-info hover:text-bank-info hover:bg-bank-info/10"
              onClick={() => onReassign(task.id)}
            >
              <ArrowRightLeft className="size-3.5" />
              Переназначить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DailyTasksPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [filterAssignee, setFilterAssignee] = useState('Все сотрудники');
  const [filterPriority, setFilterPriority] = useState('all');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterAssignee !== 'Все сотрудники' && t.assignee !== filterAssignee)
        return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterAssignee, filterPriority]);

  const counts = useMemo(() => {
    const c = { completed: 0, in_progress: 0, pending: 0, overdue: 0 };
    filteredTasks.forEach((t) => c[t.status]++);
    return c;
  }, [filteredTasks]);

  const totalTasks = filteredTasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((counts.completed / totalTasks) * 100) : 0;
  const avgCompletionTime = '2 ч 15 мин';

  const statusGroups: TaskStatus[] = [
    'overdue',
    'in_progress',
    'pending',
    'completed',
  ];

  const groupedTasks = useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    statusGroups.forEach((s) => map.set(s, []));
    filteredTasks.forEach((t) => {
      const arr = map.get(t.status);
      if (arr) arr.push(t);
    });
    return map;
  }, [filteredTasks]);

  const handleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'completed' as TaskStatus } : t)),
    );
  };

  const handleReassign = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'pending' as TaskStatus, assignee: '— awaiting —' }
          : t,
      ),
    );
  };

  return (
    <PageContainer
      title="Ежедневные задачи"
      subtitle="План задач и контроль исполнения"
      actions={
        <button className="inline-flex items-center gap-2 rounded-lg bg-bank-red px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-bank-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bank-red/40">
          <ListChecks className="h-4 w-4" />
          Новая задача
        </button>
      }
    >
      {}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 w-[180px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue placeholder="Сотрудник" />
            </SelectTrigger>
            <SelectContent>
              {assignees.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-bank-success/10">
                <CheckCircle2 className="size-5 text-bank-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Выполнено</p>
                <p className="text-xl font-bold text-bank-success">
                  {counts.completed}
                </p>
              </div>
            </div>
            <Progress
              value={completionRate}
              className="h-2 *:data-[slot=progress-indicator]:bg-bank-success"
            />
            <p className="mt-1 text-[11px] text-muted-foreground text-right">
              {completionRate}% от общего
            </p>
          </CardContent>
        </Card>

        {}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-bank-warning/10">
                <Clock className="size-5 text-bank-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">В процессе</p>
                <p className="text-xl font-bold text-bank-warning">
                  {counts.in_progress}
                </p>
              </div>
            </div>
            <Progress
              value={totalTasks > 0 ? (counts.in_progress / totalTasks) * 100 : 0}
              className="h-2 *:data-[slot=progress-indicator]:bg-bank-warning"
            />
            <p className="mt-1 text-[11px] text-muted-foreground text-right">
              {totalTasks > 0
                ? Math.round((counts.in_progress / totalTasks) * 100)
                : 0}
              % от общего
            </p>
          </CardContent>
        </Card>

        {}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Circle className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">В ожидании</p>
                <p className="text-xl font-bold text-muted-foreground">
                  {counts.pending}
                </p>
              </div>
            </div>
            <Progress
              value={totalTasks > 0 ? (counts.pending / totalTasks) * 100 : 0}
              className="h-2"
            />
            <p className="mt-1 text-[11px] text-muted-foreground text-right">
              {totalTasks > 0
                ? Math.round((counts.pending / totalTasks) * 100)
                : 0}
              % от общего
            </p>
          </CardContent>
        </Card>

        {}
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-bank-red/10">
                <AlertTriangle className="size-5 text-bank-red" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Просрочено</p>
                <p className="text-xl font-bold text-bank-red">
                  {counts.overdue}
                </p>
              </div>
            </div>
            <Progress
              value={totalTasks > 0 ? (counts.overdue / totalTasks) * 100 : 0}
              className="h-2 *:data-[slot=progress-indicator]:bg-bank-red"
            />
            <p className="mt-1 text-[11px] text-muted-foreground text-right">
              {totalTasks > 0
                ? Math.round((counts.overdue / totalTasks) * 100)
                : 0}
              % от общего
            </p>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bank-active">
              <BarChart3 className="size-5 text-bank-red" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Процент выполнения</p>
              <p className="text-lg font-bold text-foreground">
                {completionRate}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bank-red/10">
              <AlertTriangle className="size-5 text-bank-red" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Просроченных задач</p>
              <p className="text-lg font-bold text-bank-red">{counts.overdue}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bank-info/10">
              <Timer className="size-5 text-bank-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ср. время выполнения</p>
              <p className="text-lg font-bold text-foreground">
                {avgCompletionTime}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="space-y-6">
        {statusGroups.map((status) => {
          const groupTasks = groupedTasks.get(status) ?? [];
          if (groupTasks.length === 0) return null;
          const config = STATUS_CONFIG[status];
          const StatusIcon = config.icon;

          return (
            <div key={status}>
              {}
              <div className="mb-3 flex items-center gap-2">
                <StatusIcon className={cn('size-4', config.color)} />
                <h3 className={cn('text-sm font-semibold', config.color)}>
                  {config.label}
                </h3>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[11px] font-medium',
                    config.bg,
                    config.color,
                    config.border,
                  )}
                >
                  {groupTasks.length}
                </Badge>
                <ChevronRight className="size-3 text-muted-foreground ml-1" />
              </div>

              {}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {groupTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onReassign={handleReassign}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {}
      {filteredTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CircleDot className="size-10 mb-3 opacity-40" />
          <p className="text-sm font-medium">Задачи не найдены</p>
          <p className="text-xs mt-1">
            Попробуйте изменить фильтры или выбрать другую дату
          </p>
        </div>
      )}
    </PageContainer>
  );
}
