'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/stores/auth-store';

const registerSchema = z.object({
  username: z.string().min(1, 'Введите логин'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().min(1, 'Введите телефон'),
  fullName: z.string().min(1, 'Введите ФИО'),
  password: z.string().min(6, 'Минимум 6 символов'),
  roleIds: z.array(z.number()).min(1, 'Выберите хотя бы одну роль'),
  
  salary: z.string().optional(),
  position: z.string().optional(),
  plan: z.string().optional(),
  salaryProject: z.string().optional(),
  placeWork: z.string().optional(),

  officeTitle: z.string().optional(),
  officeCode: z.string().optional(),
  officeDesc: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.roleIds.includes(6) && data.roleIds.includes(8)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Нельзя выбрать обе роли: Карточник и Кредитник',
      path: ['roleIds']
    });
  }
  const hasEmployeeRole = data.roleIds.includes(6) || data.roleIds.includes(8);
  if (hasEmployeeRole) {
    if (!data.salary) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Обязательно', path: ['salary'] });
    if (!data.position) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Обязательно', path: ['position'] });
    if (!data.plan) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Обязательно', path: ['plan'] });
    if (!data.salaryProject) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Обязательно', path: ['salaryProject'] });
    if (!data.placeWork) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Обязательно', path: ['placeWork'] });
  }

  if (data.roleIds.includes(5)) {
    if (!data.officeTitle) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Обязательно', path: ['officeTitle'] });
    if (!data.officeCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Обязательно', path: ['officeCode'] });
    if (!data.officeDesc) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Обязательно', path: ['officeDesc'] });
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<{ ID: number, Name: string }[]>([]);
  const [offices, setOffices] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  const { toast } = useToast();
  const router = useRouter();
  const { tokens, register } = useAuthStore();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      phone: '',
      fullName: '',
      password: '',
      roleIds: [],
      salary: '',
      position: '',
      plan: '',
      salaryProject: '',
      placeWork: '',
      officeTitle: '',
      officeCode: '',
      officeDesc: '',
    },
  });

  const selectedRoles = form.watch('roleIds');
  const hasEmployeeRole = selectedRoles.includes(6) || selectedRoles.includes(8);
  const hasOfficeRole = selectedRoles.includes(5);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/roles`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokens?.accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Ошибка загрузки ролей');
        const data = await response.json();
        setRoles(data);
      } catch (err) {
        toast({ title: 'Ошибка', description: 'Не удалось загрузить список ролей', variant: 'destructive' });
      } finally {
        setLoadingRoles(false);
      }
    };
    if (tokens?.accessToken) {
      fetchRoles();
    } else {
      setLoadingRoles(false);
    }
  }, [tokens, toast]);

  useEffect(() => {
    if (hasEmployeeRole && offices.length === 0 && tokens?.accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/office`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokens?.accessToken}` },
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setOffices(data.map((item: any) => item.title));
        }
      })
      .catch(console.error);
    }
  }, [hasEmployeeRole, tokens, offices.length]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const payload: any = {
        Username: data.username,
        Email: data.email,
        Phone: data.phone,
        full_name: data.fullName,
        Password: data.password,
        role_ids: data.roleIds,
      };

      if (hasEmployeeRole) {
        payload.Salary = Number(data.salary);
        payload.position = data.position;
        payload.plan = Number(data.plan);
        payload.salary_project = Number(data.salaryProject);
        payload.place_work = data.placeWork;
      }

      if (hasOfficeRole) {
        payload.office_title = data.officeTitle;
        payload.office_desc = data.officeDesc;
        payload.office_code = data.officeCode;
      }

      await register(payload);
      toast({ title: 'Успешно', description: 'Пользователь зарегистрирован' });
      router.push('/operator/reports');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Ошибка регистрации',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C8102E]">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Регистрация пользователя</CardTitle>
            <CardDescription>Создание нового пользователя в системе</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Логин</FormLabel><FormControl><Input placeholder="Логин" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="Email" type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Телефон</FormLabel><FormControl><Input placeholder="Телефон" type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>ФИО</FormLabel><FormControl><Input placeholder="ФИО" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? 'text' : 'password'} placeholder="Пароль" {...field} className="pr-10" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-3">
                  <FormLabel className="text-base">Роли</FormLabel>
                  {loadingRoles ? (
                    <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка ролей...</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md">
                      {roles.map(role => (
                        <FormField key={role.ID} control={form.control} name="roleIds" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value?.includes(role.ID)} onCheckedChange={(checked) => {
                                return checked 
                                  ? field.onChange([...field.value, role.ID])
                                  : field.onChange(field.value?.filter(v => v !== role.ID))
                              }} />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {role.Name}
                            </FormLabel>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                  )}
                  {form.formState.errors.roleIds && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.roleIds.message}</p>
                  )}
                </div>

                {hasEmployeeRole && (
                  <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                    <h4 className="font-medium">Дополнительные данные (сотрудник)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="salary" render={({ field }) => (
                        <FormItem><FormLabel>Сумма оклада</FormLabel><FormControl><Input type="number" placeholder="Оклад" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="position" render={({ field }) => (
                        <FormItem><FormLabel>Позиция</FormLabel><FormControl><Input placeholder="Позиция" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="plan" render={({ field }) => (
                        <FormItem><FormLabel>План</FormLabel><FormControl><Input type="number" placeholder="План" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="salaryProject" render={({ field }) => (
                        <FormItem><FormLabel>ЗП проект</FormLabel><FormControl><Input type="number" placeholder="ЗП проект" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="placeWork" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Место работы (офис)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Выберите место работы" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {offices.map(office => (
                                <SelectItem key={office} value={office}>{office}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {hasOfficeRole && (
                  <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                    <h4 className="font-medium">Данные об офисе</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="officeTitle" render={({ field }) => (
                        <FormItem><FormLabel>Название офиса</FormLabel><FormControl><Input placeholder="Название офиса" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="officeCode" render={({ field }) => (
                        <FormItem><FormLabel>Код офиса</FormLabel><FormControl><Input placeholder="Код" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="officeDesc" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Описание</FormLabel><FormControl><Input placeholder="Описание" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" style={{ backgroundColor: '#C8102E' }} disabled={form.formState.isSubmitting || loadingRoles}>
                  {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Регистрация...</> : 'Зарегистрировать'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
