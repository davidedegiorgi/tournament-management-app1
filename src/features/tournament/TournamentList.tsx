
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TournamentService } from './tournament.service'
import type { Tournament } from './tournament.type'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { Trophy, Calendar, MapPin, Play, CheckCircle, Clock, Plus, ArrowRight, Flame, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useState } from 'react'

type TournamentListProps = {
    onCreate: () => void
    onSelect: (tournament: Tournament) => void
}

const statusConfig = {
    setup: { label: 'Configurazione', icon: Clock, variant: 'secondary' as const, className: 'bg-muted' },
    pending: { label: 'In attesa', icon: Clock, variant: 'secondary' as const, className: 'bg-muted' },
    in_progress: { label: 'In corso', icon: Flame, variant: 'default' as const, className: 'bg-primary animate-pulse-ring' },
    completed: { label: 'Completato', icon: CheckCircle, variant: 'outline' as const, className: 'bg-primary/10 text-primary' },
}

export function TournamentList({ onCreate, onSelect }: TournamentListProps) {
    const [deletingTournament, setDeletingTournament] = useState<number | null>(null)
    const queryClient = useQueryClient()

    const { data: tournaments = [], isPending, isError } = useQuery({
        queryKey: ['tournaments'],
        queryFn: () => TournamentService.list(),
    })

    const deleteMutation = useMutation({
        mutationFn: TournamentService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tournaments'] })
            setDeletingTournament(null)
            toast.success('Torneo eliminato con successo')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Errore nell\'eliminazione del torneo')
        },
    })

    const handleDelete = (tournamentId: number) => {
        deleteMutation.mutate(tournamentId)
    }

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-destructive">Errore nel caricamento dei tornei</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b bg-linear-to-r from-primary/5 to-accent/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Trophy className="size-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Tornei</CardTitle>
                            <CardDescription className="hidden sm:block">Gestisci i tornei a eliminazione diretta</CardDescription>
                        </div>
                    </div>
                    <Button onClick={onCreate} className="gap-2 group w-full sm:w-auto">
                        <Plus className="size-4 transition-transform group-hover:rotate-90" />
                        <span>Nuovo Torneo</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {isPending ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <Spinner className="size-12 text-[#00C8FF]" />
                            <p className="text-sm text-muted-foreground">Caricamento tornei...</p>
                        </div>
                    </div>
                ) : (
                    <div className={cn(
                        "grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[200px]",
                        tournaments.length > 0 && "stagger-children"
                    )}>
                        {!tournaments.length && (
                            <Empty className="col-span-full">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Trophy className="size-12" />
                                    </EmptyMedia>
                                    <EmptyTitle>Nessun torneo</EmptyTitle>
                                    <EmptyDescription>
                                        Crea il tuo primo torneo per iniziare le competizioni
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button onClick={onCreate} className="gap-2">
                                        <Plus className="size-4" />
                                        Crea Torneo
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        )}

                    {tournaments.map((tournament, index) => {
                        const status = statusConfig[tournament.status] || statusConfig.setup
                        const StatusIcon = status.icon

                        return (
                            <div
                                key={tournament.id}
                                className="flex flex-col gap-4 p-5 border rounded-xl bg-card card-hover relative overflow-hidden group"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Hover gradient */}
                                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-start justify-between relative">
                                    <button
                                        type="button"
                                        onClick={() => onSelect(tournament)}
                                        className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                                    >
                                        <div className={cn(
                                            "size-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                            tournament.status === 'completed' ? 'bg-accent/10' : 'bg-primary/10'
                                        )}>
                                            <Trophy className={cn(
                                                "size-6",
                                                tournament.status === 'completed' ? 'text-accent' : 'text-primary'
                                            )} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{tournament.name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3.5" />
                                                    {new Date(tournament.date).toLocaleDateString('it-IT', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="size-3.5" />
                                                    {tournament.location}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={status.variant} className={cn(
                                            "flex items-center gap-1.5",
                                            status.className
                                        )}>
                                            <StatusIcon className="size-3" />
                                            {status.label}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeletingTournament(tournament.id)
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onSelect(tournament)}
                                    className="flex items-center justify-between relative cursor-pointer"
                                >
                                    {tournament.winner ? (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10">
                                            <Trophy className="size-4 text-accent" />
                                            <span className="text-sm">
                                                Vincitore: <strong className="text-black dark:text-accent-foreground">{tournament.winner.name}</strong>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Play className="size-4" />
                                            {tournament.status === 'in_progress' ? 'Torneo in corso' : 'Torneo da iniziare'}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        Apri tabellone
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </button>
                            </div>
                        )
                    })}
                    </div>
                )}
            </CardContent>

            <AlertDialog
                open={deletingTournament !== null}
                onOpenChange={() => setDeletingTournament(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Questa azione non può essere annullata. Il torneo verrà eliminato permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingTournament && handleDelete(deletingTournament)}
                        >
                            Elimina
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}