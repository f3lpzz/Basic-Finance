import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle, FileText, DollarSign, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTransactions } from '@/hooks/useTransactions';
import { Navigate } from 'react-router-dom';

const Transparencia = () => {
  const { session, loading: authLoading } = useAuth();
  const { transactions, stats, loading } = useTransactions();

  // Require authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Portal da Transparência</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Dados Financiais Pessoais
            </p>
            <p className="text-sm text-muted-foreground">
              Acompanhe suas movimentações financeiras em tempo real
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Balance Overview */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  R$ {stats.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  R$ {stats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total gasto este mês
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Movimentações Financeiras</CardTitle>
            <CardDescription>
              Histórico completo de todas as transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />
                      <div>
                        <div className="h-4 w-48 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada.
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{transaction.categories?.name || 'Sem categoria'}</span>
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
                      
                      {transaction.receipt_url && (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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