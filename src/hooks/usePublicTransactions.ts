import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  created_at: string;
  categories?: {
    name: string;
    color: string | null;
  };
  receipt_url?: string;
}

interface TransactionStats {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export const usePublicTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicTransactions();
  }, []);

  const fetchPublicTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTransactions: Transaction[] = (data || []).map(transaction => ({
        id: transaction.id,
        type: transaction.type as 'income' | 'expense',
        amount: Number(transaction.amount),
        description: transaction.description,
        created_at: transaction.created_at,
        categories: transaction.categories,
        receipt_url: transaction.receipt_url || undefined,
      }));

      setTransactions(formattedTransactions);
      calculateStats(formattedTransactions);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching public transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: Transaction[]) => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    setStats({
      balance,
      totalIncome,
      totalExpenses,
    });
  };

  return {
    transactions,
    stats,
    loading,
    error,
    refetch: fetchPublicTransactions,
  };
};