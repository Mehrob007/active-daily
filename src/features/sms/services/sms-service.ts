export const sendSms = async (phoneNumber: string, messageContent: string): Promise<any> => {
  const backendSMS = process.env.NEXT_PUBLIC_BACKEND_SMS_URL;

  if (!backendSMS) {
    throw new Error('Не настроен URL для отправки SMS (NEXT_PUBLIC_BACKEND_SMS_URL)');
  }

  const res = await fetch(`${backendSMS}/api/SendSmsToTelegramNum/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, messageContent }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ошибка при отправке SMS');
  }

  return await res.json().catch(() => ({}));
};
