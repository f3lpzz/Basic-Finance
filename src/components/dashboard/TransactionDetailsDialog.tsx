import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface TransactionDetails {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  created_at: string;
  categories?: {
    name: string;
    color: string | null;
  } | null;
  receipt_url?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionDetails;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif)$/i.test(url);
const isPdfUrl = (url: string) => /\.pdf$/i.test(url);

export const TransactionDetailsDialog: React.FC<Props> = ({ open, onOpenChange, transaction }) => {
  const receiptType = useMemo(() => {
    if (!transaction?.receipt_url) return 'none';
    const url = transaction.receipt_url;
    if (isImageUrl(url)) return 'image';
    if (isPdfUrl(url)) return 'pdf';
    return 'file';
  }, [transaction?.receipt_url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes da transação</DialogTitle>
          <DialogDescription>
            {new Date(transaction.created_at).toLocaleString('pt-BR')}
          </DialogDescription>
        </DialogHeader>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article>
            <h2 className="text-sm text-muted-foreground mb-1">Tipo</h2>
            <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
              {transaction.type === 'income' ? 'Entrada' : 'Saída'}
            </Badge>
          </article>

          <article>
            <h2 className="text-sm text-muted-foreground mb-1">Valor</h2>
            <p className="text-xl font-semibold">{formatCurrency(transaction.amount)}</p>
          </article>

          <article>
            <h2 className="text-sm text-muted-foreground mb-1">Categoria</h2>
            <p>{transaction.categories?.name || 'Sem categoria'}</p>
          </article>

          <article className="md:col-span-2">
            <h2 className="text-sm text-muted-foreground mb-1">Descrição</h2>
            <p>{transaction.description}</p>
          </article>

          <article className="md:col-span-2">
            <h2 className="text-sm text-muted-foreground mb-2">Comprovante</h2>
            {!transaction.receipt_url ? (
              <p className="text-muted-foreground">Nenhum arquivo anexado.</p>
            ) : (
              <div className="space-y-3">
                {receiptType === 'image' && (
                  <img
                    src={transaction.receipt_url || ''}
                    alt={`Comprovante da transação ${transaction.description}`}
                    loading="lazy"
                    className="w-full max-h-[60vh] object-contain rounded border"
                  />
                )}
                {receiptType === 'pdf' && (
                  <iframe
                    src={transaction.receipt_url || ''}
                    title="Visualização do PDF"
                    className="w-full h-[60vh] rounded border"
                  />
                )}
                {receiptType === 'file' && (
                  <p className="text-muted-foreground">Pré-visualização não disponível para este tipo de arquivo.</p>
                )}
                <div>
                  <Button asChild variant="outline">
                    <a href={transaction.receipt_url || ''} target="_blank" rel="noopener noreferrer" download>
                      Baixar arquivo
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </article>
        </section>
      </DialogContent>
    </Dialog>
  );
};
