import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { BalanceCard } from './BalanceCard';
import { TransactionList } from './TransactionList';
import { AddTransactionDialog } from './AddTransactionDialog';
import { useState } from 'react';
import { LogOut, Eye } from 'lucide-react';
import { CategoriesDialog } from '@/components/categories/CategoriesDialog';

export const Dashboard: React.FC = () => {
  const { signOut } = useAuth();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestão Financeira</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('/transparencia', '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Portal Transparência
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <BalanceCard />
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Adicione novas transações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button 
                  className="w-full" 
                  onClick={() => setShowAddTransaction(true)}
                >
                  Nova Transação
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => setShowCategories(true)}
                >
                  Categorias
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <TransactionList />
      </main>

      <AddTransactionDialog 
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
      />
      <CategoriesDialog 
        open={showCategories}
        onOpenChange={setShowCategories}
      />
    </div>
  );
};