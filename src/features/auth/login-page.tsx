'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Shield, Users, MonitorSmartphone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigationStore } from '@/stores/navigation-store';
import type { RoleId, User } from '@/types';

const loginSchema = z.object({
  username: z.string().min(1, 'Введите имя пользователя'),
  password: z.string().min(1, 'Введите пароль'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Demo users for preview ─────────────────────────────────────
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin',
    user: {
      id: 'USR-001',
      username: 'admin',
      firstName: 'Асанов',
      lastName: 'Марат',
      role: 9 as RoleId,
      roleName: 'Председатель',
      branch: 'Головной офис',
      email: 'admin@activbank.kz',
      phone: '+7 701 000 0001',
      isActive: true,
      lastLogin: new Date().toISOString(),
    },
  },
  agent: {
    password: 'agent',
    user: {
      id: 'USR-010',
      username: 'agent',
      firstName: 'Каримова',
      lastName: 'Нодира',
      role: 10 as RoleId,
      roleName: 'Агент Карты',
      branch: 'Филиал Алмалы',
      email: 'karimova@activbank.kz',
      phone: '+7 701 000 0010',
      isActive: true,
      lastLogin: new Date().toISOString(),
    },
  },
  operator: {
    password: 'operator',
    user: {
      id: 'USR-050',
      username: 'operator',
      firstName: 'Турсынов',
      lastName: 'Бекзод',
      role: 17 as RoleId,
      roleName: 'Фронтовик (ABS)',
      branch: 'Процессинг',
      email: 'tursynov@activbank.kz',
      phone: '+7 701 000 0050',
      isActive: true,
      lastLogin: new Date().toISOString(),
    },
  },
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, setTokens, isLoading } = useAuthStore();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Demo mode: check against demo users, fallback to real API
      const demoUser = DEMO_USERS[data.username];
      if (demoUser && demoUser.password === data.password) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 600));
        setTokens({
          accessToken: 'demo-access-token-' + Date.now(),
          refreshToken: 'demo-refresh-token-' + Date.now(),
          expiresIn: 3600,
        });
        // Directly set user in store
        useAuthStore.setState({ 
          user: { ...demoUser.user, roleIds: [demoUser.user.role as number] }, 
          isAuthenticated: true 
        });
        
        let targetPage = 'dashboard';
        const r = demoUser.user.role;
        if (r === 9) targetPage = 'chairman-reports';
        else if (r === 10) targetPage = 'applications';
        else if (r === 17) targetPage = 'abs-search';
        
        useNavigationStore.getState().navigate(targetPage);

        toast({
          title: 'Добро пожаловать',
          description: `${demoUser.user.firstName} ${demoUser.user.lastName} — ${demoUser.user.roleName}`,
        });
        return;
      }

      // Try real API login
      await login(data);
      toast({
        title: 'Добро пожаловать',
        description: 'Вы успешно вошли в систему',
      });
    } catch (error) {
      toast({
        title: 'Ошибка авторизации',
        description: error instanceof Error ? error.message : 'Неверный логин или пароль',
        variant: 'destructive',
      });
    }
  };

  const handleDemoLogin = (username: string) => {
    const demoUser = DEMO_USERS[username];
    if (demoUser) {
      form.setValue('username', username);
      form.setValue('password', demoUser.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Bank branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C8102E] mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Active Daily</h1>
          <p className="text-sm text-muted-foreground mt-1">ActivBank — Банковский портал</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">Вход в систему</CardTitle>
            <CardDescription>
              Введите учётные данные для доступа к порталу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имя пользователя</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Введите логин"
                          autoComplete="username"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Введите пароль"
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-medium hover:bg-[#A00D24]"
                  style={{ backgroundColor: '#C8102E' }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    'Войти'
                  )}
                </Button>
              </form>
            </Form>

          
            <div className="mt-5 pt-3 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} ActivBank. Все права защищены.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
