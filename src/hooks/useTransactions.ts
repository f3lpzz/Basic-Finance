import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { TransactionInput } from '@/lib/validations';

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
    color: string;
  } | null;
}

interface TransactionStats {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
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

      const transactions = (data || []) as Transaction[];
      setTransactions(transactions);
      calculateStats(transactions);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: Transaction[]) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    setStats({
      balance: income - expenses,
      totalIncome: income,
      totalExpenses: expenses,
    });
  };

  const addTransaction = async (data: TransactionInput) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('transactions')
        .insert([{
          ...data,
          user_id: user?.id,
        }]);

      if (error) throw error;

      await fetchTransactions(); // Refresh data
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding transaction:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchTransactions(); // Refresh data
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting transaction:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    transactions,
    stats,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
};