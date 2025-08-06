import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, FileText, DollarSign } from 'lucide-react';

// Mock data - will be replaced with real data from Supabase
const mockPublicData = {
  organizationName: 'Empresa Exemplo LTDA',
  balance: 15420.50,
  totalEntradas: 25000.00,
  totalSaidas: 9579.50,
  transactions: [
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
  ],
};

const Transparencia = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Portal da Transparência</h1>
            <p className="text-lg text-muted-foreground mt-2">
              {mockPublicData.organizationName}
            </p>
            <p className="text-sm text-muted-foreground">
              Acompanhe as movimentações financeiras em tempo real
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Balance Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {mockPublicData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo disponível em caixa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {mockPublicData.totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Total recebido este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {mockPublicData.totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Total gasto este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações Financeiras</CardTitle>
            <CardDescription>
              Histórico completo de todas as transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPublicData.transactions.map((transaction) => (
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
                    
                    {transaction.receipt_url && (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Os dados apresentados são atualizados em tempo real.
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Transparencia;