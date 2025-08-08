import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { transactionSchema, fileSchema } from '@/lib/validations';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { addTransaction } = useTransactions();
  const { categories } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate file if present
      if (receipt) {
        const fileValidation = fileSchema.safeParse({
          size: receipt.size,
          type: receipt.type,
        });
        
        if (!fileValidation.success) {
          toast({
            title: "Arquivo inválido",
            description: fileValidation.error.issues[0].message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Validate form data
      const validation = transactionSchema.safeParse({
        type,
        amount: parseFloat(amount),
        description,
        category_id: categoryId,
      });

      if (!validation.success) {
        toast({
          title: "Dados inválidos",
          description: validation.error.issues[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const result = await addTransaction(validation.data);
      
      if (result.success) {
        toast({
          title: "Transação adicionada!",
          description: "A transação foi registrada com sucesso.",
        });
        
        // Reset form
        setAmount('');
        setDescription('');
        setCategoryId('');
        setReceipt(null);
        onOpenChange(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar transação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova entrada ou saída financeira
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Tipo de Transação</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => {
                setType(value as 'income' | 'expense');
                setCategoryId(''); // Reset category when type changes
              }}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600">Entrada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600">Saída</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Anexar Nota Fiscal (opcional)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="receipt"
                className="flex items-center space-x-2 cursor-pointer border border-input rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                <span>{receipt ? receipt.name : 'Escolher arquivo'}</span>
              </Label>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Transação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};