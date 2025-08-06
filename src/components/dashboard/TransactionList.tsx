import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle, FileText, Trash2 } from 'lucide-react';

// Mock data - will be replaced with real data from Supabase
const mockTransactions = [
  {
    id: '1',
    type: 'entrada',
    amount: 5000.00,
    description: 'Venda de produtos',
    category: 'Vendas',
    created_at: '2024-01-15',
    receipt_url: null,
  },
  {
    id: '2',
    type: 'saida',
    amount: 1200.00,
    description: 'Compra de materiais',
    category: 'Fornecedores',
    created_at: '2024-01-14',
    receipt_url: 'receipt-url',
  },
  {
    id: '3',
    type: 'entrada',
    amount: 3500.00,
    description: 'Serviços prestados',
    category: 'Receita',
    created_at: '2024-01-13',
    receipt_url: null,
  },
];

export const TransactionList: React.FC = () => {
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
          {mockTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {transaction.type === 'entrada' ? (
                    <ArrowUpCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{new Date(transaction.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`font-medium ${
                    transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'entrada' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <Badge variant={transaction.type === 'entrada' ? 'default' : 'secondary'}>
                    {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                  </Badge>
                </div>
                
                <div className="flex space-x-1">
                  {transaction.receipt_url && (
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};