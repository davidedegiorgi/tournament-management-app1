import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamService } from './team.service';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { TeamForm } from './TeamForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { getLogoUrl } from '@/lib/backend';

export function TeamList() {
  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: teamService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setDeletingTeam(null);
      toast.success('Squadra eliminata con successo');
    },
    onError: () => {
      toast.error('Impossibile eliminare una squadra che partecipa in uno o più tornei');
    },
  });

  const handleDelete = (teamId: number) => {
    deleteMutation.mutate(teamId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-12 text-[#00C8FF]" />
          <p className="text-sm text-muted-foreground">Caricamento squadre...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con pulsante Aggiungi */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
        <h2 className="text-2xl font-bold">Squadre</h2>
        <Button onClick={() => setIsCreating(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span className="sm:inline">Aggiungi Squadra</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams?.map((team) => (
          <div 
            key={team.id} 
            className="border border-slate-200 dark:border-[#00C8FF]/20 rounded-xl p-6 bg-white dark:bg-[#1B3A8F]/30 backdrop-blur-xl hover:border-slate-300 dark:hover:border-[#00C8FF]/50 transition-all hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-[#00C8FF]/10"
          >
            <div className="space-y-4">
              {team.logo && (
                <div className="flex justify-center">
                  <img
                    src={getLogoUrl(team.logo)}
                    alt={team.name}
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <h3 className="font-semibold text-lg text-center">{team.name}</h3>
              <div className="flex gap-2 justify-center pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingTeam(team.id)}
                  className="border-[#00C8FF]/30 hover:border-[#00C8FF] hover:bg-[#00C8FF]/10"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeletingTeam(team.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Form Dialog for creating */}
      <TeamForm
        team={null}
        open={isCreating}
        onOpenChange={(open) => !open && setIsCreating(false)}
      />

      {/* Team Form Dialog for editing */}
      <TeamForm
        team={editingTeam ? teams?.find(t => t.id === editingTeam) : null}
        open={editingTeam !== null}
        onOpenChange={(open) => !open && setEditingTeam(null)}
      />

      <AlertDialog
        open={deletingTeam !== null}
        onOpenChange={() => setDeletingTeam(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. La squadra verrà eliminata definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingTeam && handleDelete(deletingTeam)}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
