import { useEffect } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Shield } from 'lucide-react'
import { getLogoUrl } from '@/lib/backend'
import type { Match } from './match.type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    FormLabelNoError,
} from '@/components/ui/form'

const matchScoreSchema = z.object({
    score1: z.coerce.number().int().min(0, 'Il punteggio deve essere maggiore o uguale a 0'),
    score2: z.coerce.number().int().min(0, 'Il punteggio deve essere maggiore o uguale a 0'),
}).refine((data) => data.score1 !== data.score2, {
    message: 'I pareggi non sono ammessi',
    path: ['score2'], // Mostra l'errore sul secondo campo
})

type MatchScoreData = z.infer<typeof matchScoreSchema>

type MatchScoreDialogProps = {
    match: Match | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (score1: number, score2: number) => void
    isPending: boolean
}

export function MatchScoreDialog({ match, open, onOpenChange, onSubmit, isPending }: MatchScoreDialogProps) {
    const form = useForm<MatchScoreData>({
        resolver: zodResolver(matchScoreSchema),
        defaultValues: {
            score1: 0,
            score2: 0,
        },
    })

    useEffect(() => {
        if (match && open) {
            form.reset({
                score1: match.score1 ?? 0,
                score2: match.score2 ?? 0,
            })
        }
    }, [match, open, form])

    function handleSubmit(values: z.infer<typeof matchScoreSchema>) {
        onSubmit(values.score1, values.score2)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Inserisci Risultato</DialogTitle>
                            <DialogDescription>
                                Inserisci il punteggio finale della partita. I pareggi non sono ammessi.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <FormField
                                    control={form.control}
                                    name="score1"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="flex items-center gap-2">
                                                {match?.team1?.logo ? (
                                                    <img
                                                        src={getLogoUrl(match.team1.logo)}
                                                        alt={match.team1.name}
                                                        className="size-6 rounded object-contain bg-white"
                                                    />
                                                ) : (
                                                    <Shield className="size-4" />
                                                )}
                                                {match?.team1?.name || 'Squadra 1'}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    placeholder="0"
                                                    className="text-center text-2xl font-bold h-14"
                                                />
                                            </FormControl>
                                            {/* Nessun messaggio di errore sotto il campo */}
                                        </FormItem>
                                    )}
                                />
                                <span className="text-2xl font-bold text-muted-foreground pt-6">-</span>
                                <FormField
                                    control={form.control}
                                    name="score2"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabelNoError className="flex items-center gap-2 text-foreground">
                                                {match?.team2?.logo ? (
                                                    <img
                                                        src={getLogoUrl(match.team2.logo)}
                                                        alt={match.team2.name}
                                                        className="size-6 rounded object-contain bg-white"
                                                    />
                                                ) : (
                                                    <Shield className="size-4" />
                                                )}
                                                {match?.team2?.name || 'Squadra 2'}
                                            </FormLabelNoError>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    placeholder="0"
                                                    className="text-center text-2xl font-bold h-14"
                                                />
                                            </FormControl>
                                            {/* Nessun messaggio di errore sotto il campo */}
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Messaggio di errore centrato in caso di pareggio */}
                            {form.formState.errors.score2?.message === 'I pareggi non sono ammessi' && (
                                <div className="flex items-center justify-start py-2">
                                    <span className="text-destructive text-left w-full font-semibold">
                                        {form.formState.errors.score2.message}
                                    </span>
                                </div>
                            )}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Annulla
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Salvataggio...' : 'Salva Risultato'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}