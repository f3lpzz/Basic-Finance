import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle, FileText, Trash2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { TransactionDetailsDialog } from './TransactionDetailsDialog';
import { DateRangeFilter } from './DateRangeFilter';
interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export const TransactionList: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const { transactions, loading, deleteTransaction } = useTransactions(dateRange);
  const { toast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<(typeof transactions)[number] | null>(null);

  const handleDelete = async (id: string) => {
    const result = await deleteTransaction(id);
    if (result.success) {
      toast({
        title: "Transação removida",
        description: "A transação foi removida com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao remover transação.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
          <CardDescription>
            Histórico das movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />
                  <div>
                    <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Últimas Transações</CardTitle>
              <CardDescription>
                Histórico das movimentações financeiras
              </CardDescription>
            </div>
            <DateRangeFilter onDateRangeChange={setDateRange} />
          </div>
        </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação encontrada. Adicione sua primeira transação!
            </div>
          ) : (
            transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
              onClick={() => { setSelected(transaction); setDetailsOpen(true); }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {transaction.type === 'income' ? (
                    <ArrowUpCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="group">
                  <p className="font-medium underline-offset-4 group-hover:underline">{transaction.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full border border-input"
                        style={{ backgroundColor: transaction.categories?.color || 'transparent' }}
                      />
                      <span>{transaction.categories?.name || 'Sem categoria'}</span>
                    </span>
                    <span>•</span>
                    <span>{new Date(transaction.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                    {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                  </Badge>
                </div>
                
                <div className="flex space-x-1">
                  {transaction.receipt_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setSelected(transaction); setDetailsOpen(true); }}
                      aria-label="Ver detalhes e comprovante"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600"
                    onClick={(e) => { e.stopPropagation(); handleDelete(transaction.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
    {selected && (
      <TransactionDetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => { setDetailsOpen(open); if (!open) setSelected(null); }}
        transaction={selected}
      />
    )}
  </>
);
};