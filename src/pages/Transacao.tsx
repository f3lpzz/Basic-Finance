import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category_id: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    color: string | null;
  } | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif)$/i.test(url);
const isPdfUrl = (url: string) => /\.pdf$/i.test(url);

const Transacao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Detalhes da Transação';
  }, []);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('transactions')
          .select(`*, categories ( name, color )`)
          .eq('id', id)
          .single();
        if (error) throw error;
        if (!data) throw new Error('Transação não encontrada');
        const t: Transaction = {
          id: data.id,
          user_id: data.user_id,
          type: data.type as 'income' | 'expense',
          amount: Number(data.amount),
          description: data.description,
          category_id: data.category_id,
          receipt_url: data.receipt_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
          categories: data.categories || null,
        };
        setTransaction(t);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTransaction();
  }, [id]);

  const receiptType = useMemo(() => {
    if (!transaction?.receipt_url) return 'none';
    const url = transaction.receipt_url;
    if (isImageUrl(url)) return 'image';
    if (isPdfUrl(url)) return 'pdf';
    return 'file';
  }, [transaction?.receipt_url]);

  if (loading) {
    return (
      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
            <CardDescription>Estamos buscando os detalhes da transação.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-56 bg-muted animate-pulse rounded" />
              <div className="h-64 w-full bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error || !transaction) {
    return (
      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>{error || 'Transação não encontrada.'}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <>
      <header className="sr-only">
        <h1>Detalhes da Transação</h1>
      </header>
      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{transaction.description}</CardTitle>
                <CardDescription>
                  {new Date(transaction.created_at).toLocaleString('pt-BR')}
                </CardDescription>
              </div>
              <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                {transaction.type === 'income' ? 'Entrada' : 'Saída'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        src={transaction.receipt_url}
                        alt={`Comprovante da transação ${transaction.description}`}
                        loading="lazy"
                        className="w-full max-h-[600px] object-contain rounded border"
                      />
                    )}
                    {receiptType === 'pdf' && (
                      <iframe
                        src={transaction.receipt_url}
                        title="Visualização do PDF"
                        className="w-full h-[600px] rounded border"
                      />
                    )}
                    {receiptType === 'file' && (
                      <p className="text-muted-foreground">Pré-visualização não disponível para este tipo de arquivo.</p>
                    )}
                    <div>
                      <Button asChild variant="outline">
                        <a href={transaction.receipt_url} target="_blank" rel="noopener noreferrer" download>
                          Baixar arquivo
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            </section>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Transacao;
