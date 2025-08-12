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

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export const useTransactions = (dateRange?: DateRange) => {
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
  }, [user, dateRange]);

  // Listen for local update events (e.g., after add/delete)
  useEffect(() => {
    const handler = () => fetchTransactions();
    window.addEventListener('transactions:updated', handler);
    return () => window.removeEventListener('transactions:updated', handler);
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color
          )
        `);

      // Apply date range filter if provided
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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

  // Realtime subscription for transactions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('realtime-transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  const addTransaction = async (data: TransactionInput, file?: File) => {
    try {
      setError(null);

      let receipt_url = null;

      // Upload file if provided
      if (file && user) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName);

        receipt_url = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('transactions')
        .insert([{
          ...data,
          user_id: user?.id,
          receipt_url,
        }]);

      if (error) throw error;

      await fetchTransactions();
      window.dispatchEvent(new Event('transactions:updated')); // Notify other subscribers
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

      await fetchTransactions();
      window.dispatchEvent(new Event('transactions:updated')); // Notify other subscribers
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