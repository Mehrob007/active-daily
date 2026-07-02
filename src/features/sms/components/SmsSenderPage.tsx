'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/widgets/page-container/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { sendSms } from '../services/sms-service';

export function SmsSenderPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim() || !messageContent.trim()) {
      toast.error('Пожалуйста, заполните номер телефона и текст сообщения');
      return;
    }

    // Optional validation for basic format
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phoneNumber.replace(/\+/g, ''))) {
      toast.error('Неверный формат номера телефона. Используйте только цифры (и + в начале)');
      return;
    }

    try {
      setLoading(true);
      await sendSms(phoneNumber, messageContent);
      toast.success('Сообщение успешно отправлено!');
      setPhoneNumber('');
      setMessageContent('');
    } catch (err: any) {
      console.error(err);
      toast.error(`Ошибка отправки: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Агент по SMS" description="Отправка SMS-сообщений">
      <div className="flex justify-center mt-6">
        <Card className="w-full max-w-lg shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Отправка SMS
            </CardTitle>
            <CardDescription>
              Введите номер телефона получателя и текст сообщения для отправки.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  placeholder="Например: 992937394747"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Текст сообщения</Label>
                <Textarea
                  id="message"
                  placeholder="Привет, как дела?"
                  className="min-h-[120px] resize-none"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  'Отправить сообщение'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
