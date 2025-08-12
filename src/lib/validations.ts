import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição não pode estar vazia').max(500, 'Descrição muito longa'),
  category_id: z.string().uuid('Categoria inválida'),
  created_at: z.string().optional(),
});

export const profileSchema = z.object({
  display_name: z.string().max(100, 'Nome muito longo').optional(),
});

export const feedbackSchema = z.object({
  content: z.string().min(1, 'Conteúdo não pode estar vazio').max(1000, 'Conteúdo muito longo'),
});

// File validation schema
export const fileSchema = z.object({
  size: z.number().max(5 * 1024 * 1024, 'Arquivo deve ter no máximo 5MB'),
  type: z.string().refine((type) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'application/pdf'
    ];
    return allowedTypes.includes(type);
  }, 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou PDF'),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;