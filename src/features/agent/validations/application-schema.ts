import { z } from 'zod';

export const applicationFormSchema = z.object({
  surname: z.string().min(2, "Фамилия обязательна"),
  name: z.string().min(2, "Имя обязательно"),
  patronymic: z.string().optional(),
  birth_date: z.string().min(1, "Укажите дату рождения"),
  gender: z.number(), // 0 for Male, 1 for Female
  phone_number: z.string().min(9, "Некорректный номер телефона"),
  secret_word: z.string().optional(),
  receiving_office: z.string().optional(),
  email: z.string().email("Некорректный email").optional().or(z.literal('')),
  card_name: z.string().optional(),
  client_code: z.string().optional(),
  is_resident: z.boolean().default(false),
  
  type_of_certificate: z.number().optional(),
  documents_series: z.string().optional(),
  document_number: z.string().optional(),
  passport_issued_at: z.string().optional(),
  passport_deadline: z.string().optional(),
  issued_by: z.string().optional(),
  inn: z.string().optional(),
  
  country: z.string().optional(),
  regin_type: z.number().optional(),
  region: z.string().optional(),
  population_type: z.number().optional(),
  populated: z.string().optional(),
  district_type: z.number().optional(),
  district: z.string().optional(),
  citizenship: z.string().optional(),
  nationality: z.string().optional(),
  place_of_birth: z.string().optional(),
  street_type: z.number().optional(),
  street: z.string().optional(),
  house_number: z.string().optional(),
  corpus: z.string().optional(),
  apartment_number: z.string().optional(),
  client_index: z.string().optional(),
  
  product: z.string().min(1, "Продукт обязателен"),
  account_usd: z.string().min(1, "Счет USD обязателен"),
  account_eur: z.string().min(1, "Счет EUR обязателен"),
  account_tjs: z.string().min(1, "Счет TJS обязателен"),
  contract_number: z.string().min(1, "Номер договора обязателен"),
  contract_date: z.string().min(1, "Дата договора обязательна"),
  
  identity_verified: z.boolean().default(false),
  is_new_client: z.boolean().default(false), // "Отправить СМС?" in the old form
  message_type: z.string().optional(),
  rejection_reason: z.string().optional(),

  front_side_of_the_passport_file: z.any().optional(),
  back_side_of_the_passport_file: z.any().optional(),
  selfie_with_passport_file: z.any().optional(),
}).superRefine((data, ctx) => {
  if (data.is_new_client && !data.message_type) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Выберите тип SMS",
      path: ["message_type"],
    });
  }
  if (data.is_new_client && data.message_type === "rejected" && !data.rejection_reason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Укажите причину отклонения",
      path: ["rejection_reason"],
    });
  }
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;
