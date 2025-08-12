import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCategories } from "@/hooks/useCategories";

interface CategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoriesDialog: React.FC<CategoriesDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { categories, refetch } = useCategories();

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>("#3b82f6");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<string>("#3b82f6");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteRequiresConfirm, setDeleteRequiresConfirm] = useState(false);

  const existingNames = useMemo(() => new Set(categories.map(c => c.name.trim().toLowerCase())), [categories]);

  useEffect(() => {
    if (!open) {
      // reset
      setCreating(false);
      setNewName("");
      setNewColor("#3b82f6");
      setEditingId(null);
      setEditName("");
      setEditColor("#3b82f6");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!user) return;
    const name = newName.trim();
    if (!name) {
      toast({ title: "Nome inválido", description: "Informe um nome para a categoria.", variant: "destructive" });
      return;
    }
    if (existingNames.has(name.toLowerCase())) {
      toast({ title: "Duplicado", description: "Você já possui uma categoria com esse nome.", variant: "destructive" });
      return;
    }
    try {
      setCreating(true);
      const { error } = await supabase.from("categories").insert([{ name, color: newColor, user_id: user.id }]);
      if (error) throw error;
      await refetch();
      window.dispatchEvent(new Event("transactions:updated"));
      window.dispatchEvent(new Event("categories:updated"));
      setNewName("");
      setNewColor("#3b82f6");
      toast({ title: "Categoria criada", description: "Sua categoria foi adicionada." });
    } catch (err: any) {
      const msg = err?.message?.includes("unique") ? "Você já possui uma categoria com esse nome." : (err?.message || "Erro ao criar categoria");
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    setEditingId(id);
    setEditName(cat.name);
    setEditColor(cat.color || "#3b82f6");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !user) return;
    const name = editName.trim();
    if (!name) {
      toast({ title: "Nome inválido", description: "Informe um nome para a categoria.", variant: "destructive" });
      return;
    }
    const duplicate = categories.some(c => c.id !== editingId && c.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) {
      toast({ title: "Duplicado", description: "Você já possui uma categoria com esse nome.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("categories").update({ name, color: editColor }).eq("id", editingId).eq("user_id", user.id);
      if (error) throw error;
      await refetch();
      window.dispatchEvent(new Event("transactions:updated"));
      window.dispatchEvent(new Event("categories:updated"));
      setEditingId(null);
      toast({ title: "Categoria atualizada", description: "Alterações salvas com sucesso." });
    } catch (err: any) {
      const msg = err?.message || "Erro ao atualizar categoria";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  const requestDelete = async (id: string) => {
    if (!user) return;
    setDeleteId(id);
    // check if there are transactions using this category
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id)
      .eq("user_id", user.id);
    setDeleteRequiresConfirm((count || 0) > 0);
  };

  const handleDelete = async () => {
    if (!deleteId || !user) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", deleteId).eq("user_id", user.id);
      if (error) throw error;
      await refetch();
      window.dispatchEvent(new Event("transactions:updated"));
      window.dispatchEvent(new Event("categories:updated"));
      toast({ title: "Categoria excluída", description: "A categoria foi removida." });
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Erro ao excluir categoria", variant: "destructive" });
    } finally {
      setDeleteId(null);
      setDeleteRequiresConfirm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>Crie, edite e exclua suas categorias. Os nomes são únicos por usuário.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newName">Nome da categoria</Label>
                  <Input id="newName" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Alimentação" />
                </div>
                <div className="flex items-end gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="newColor">Cor</Label>
                    <input 
                      id="newColor" 
                      type="color" 
                      value={newColor} 
                      onChange={(e) => setNewColor(e.target.value)} 
                      className="h-10 w-12 rounded-md border border-input cursor-pointer" 
                    />
                  </div>
                  <Button type="button" onClick={handleCreate} disabled={creating} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* List */}
          <div className="space-y-3 max-h-80 overflow-auto pr-1">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma categoria criada ainda.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      aria-hidden
                      className="h-3 w-3 rounded-full border border-input"
                      style={{ backgroundColor: cat.color || "transparent" }}
                    />
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-48" />
                        <input 
                          type="color" 
                          value={editColor} 
                          onChange={(e) => setEditColor(e.target.value)} 
                          className="h-9 w-10 rounded-md border border-input cursor-pointer" 
                        />
                      </div>
                    ) : (
                      <div className="truncate">
                        <p className="font-medium truncate">{cat.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{cat.color || "Sem cor"}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === cat.id ? (
                      <>
                        <Button size="sm" variant="secondary" onClick={handleSaveEdit}>Salvar</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => startEdit(cat.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => requestDelete(cat.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteRequiresConfirm
                ? "Esta categoria está associada a transações. Tem certeza que deseja excluí-la?"
                : "Tem certeza que deseja excluir esta categoria?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default CategoriesDialog;
