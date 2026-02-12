import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Shield } from 'lucide-react'
import { TournamentService } from './tournament.service'
import { TeamService } from '../team/team.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { getLogoUrl } from '@/lib/backend'
import { toast } from 'sonner'

function isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0
}

const tournamentFormSchema = z.object({
    name: z.string().min(1, 'Il nome è obbligatorio').min(3, 'Il nome deve avere almeno 3 caratteri'),
    date: z.string().min(1, 'La data è obbligatoria'),
    location: z.string().min(1, 'La location è obbligatoria').min(3, 'La location deve avere almeno 3 caratteri'),
    teamIds: z.array(z.number())
        .min(2, 'Seleziona almeno 2 squadre')
        .max(16, 'Puoi selezionare al massimo 16 squadre')
        .refine((ids) => isPowerOfTwo(ids.length), {
            message: 'Il numero di squadre deve essere una potenza di 2 (2, 4, 8, 16)',
        }),
})

type TournamentFormData = z.infer<typeof tournamentFormSchema>

type TournamentFormProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function TournamentForm({ open, onOpenChange, onSuccess }: TournamentFormProps) {
    const queryClient = useQueryClient()

    const form = useForm<TournamentFormData>({
        resolver: zodResolver(tournamentFormSchema),
        defaultValues: {
            name: '',
            date: '',
            location: '',
            teamIds: [],
        },
    })

    const { data: teams = [], isPending: isLoadingTeams } = useQuery({
        queryKey: ['teams'],
        queryFn: () => TeamService.list(),
        enabled: open,
    })

    const { mutate: createTournament, isPending: isCreating } = useMutation({
        mutationFn: TournamentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tournaments'] })
            onOpenChange(false)
            form.reset()
            onSuccess?.()
            toast.success('Torneo creato con successo');
        },
    })

    function handleTeamToggle(teamId: number) {
        const currentTeams = form.getValues('teamIds')
        let newTeams
        if (currentTeams.includes(teamId)) {
            newTeams = currentTeams.filter(id => id !== teamId)
        } else {
            if (currentTeams.length >= 16) {
                form.setError('teamIds', { type: 'manual', message: 'Puoi selezionare al massimo 16 squadre' })
                return
            }
            newTeams = [...currentTeams, teamId]
        }
        form.setValue('teamIds', newTeams, { shouldValidate: true })
    }

    function handleSubmit(values: TournamentFormData) {
        createTournament({
            name: values.name,
            date: values.date,
            location: values.location,
            teamIds: values.teamIds,
        })
    }

    return (
        <Dialog open={open} onOpenChange={(value) => {
            if (!value) form.reset()
            onOpenChange(value)
        }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Nuovo Torneo</DialogTitle>
                            <DialogDescription>
                                Crea un nuovo torneo a eliminazione diretta
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome torneo</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Es. Coppa Primavera 2026" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Luogo</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Es. Stadio Comunale" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="date" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="teamIds"
                                render={() => (
                                    <FormItem>
                                        <div className="flex items-center justify-between mb-3">
                                            <FormLabel>Seleziona squadre partecipanti</FormLabel>
                                            <span className={cn(
                                                "text-sm",
                                                form.watch('teamIds').length > 0 && !isPowerOfTwo(form.watch('teamIds').length)
                                                    ? "text-destructive"
                                                    : "text-muted-foreground"
                                            )}>
                                                {form.watch('teamIds').length} selezionate
                                            </span>
                                        </div>
                                        <FormMessage />

                                        <div className={cn(
                                            "grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1",
                                            isLoadingTeams && 'overflow-hidden'
                                        )}>
                                            {isLoadingTeams && new Array(6).fill('').map((_, i) => (
                                                <Skeleton
                                                    className="h-12 rounded-lg"
                                                    style={{ animationDelay: 0.1 * i + 's' }}
                                                    key={i}
                                                />
                                            ))}

                                            {!isLoadingTeams && teams.map((team) => {
                                                const isSelected = form.watch('teamIds').includes(team.id)
                                                return (
                                                    <button
                                                        key={team.id}
                                                        type="button"
                                                        onClick={() => handleTeamToggle(team.id)}
                                                        className={cn(
                                                            "flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left",
                                                            isSelected
                                                                ? "border-[#00C8FF] bg-[#00C8FF]/10 dark:bg-[#00C8FF]/20"
                                                                : "border-transparent bg-muted hover:bg-muted/80"
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={isSelected}
                                                            className="pointer-events-none"
                                                        />
                                                        {team.logo ? (
                                                            <img
                                                                src={getLogoUrl(team.logo)}
                                                                alt={team.name}
                                                                className="w-6 h-6 object-contain shrink-0"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none'
                                                                }}
                                                            />
                                                        ) : (
                                                            <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
                                                        )}
                                                        <span className="text-sm truncate flex-1">{team.name}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Annulla
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? 'Creazione...' : 'Crea Torneo'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
