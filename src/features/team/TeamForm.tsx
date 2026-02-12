import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Upload, Link as LinkIcon } from 'lucide-react'
import { TeamService } from './team.service'
import type { Team, CreateTeamData, UpdateTeamData } from './team.type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { toast } from 'sonner'

const teamFormSchema = z.object({
    name: z.string().min(1, 'Il nome è obbligatorio').min(3, 'Il nome deve avere almeno 3 caratteri'),
    logo: z.string().optional(),
})

type TeamFormData = z.infer<typeof teamFormSchema>

type TeamFormProps = {
    team?: Team | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TeamForm({ team, open, onOpenChange }: TeamFormProps) {
    // Solo modalità URL per il logo
    const [logoPreview, setLogoPreview] = useState<string>('')
    const queryClient = useQueryClient()

    const form = useForm<TeamFormData>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            name: '',
            logo: '',
        },
    })

    useEffect(() => {
        if (open) {
            if (team) {
                form.reset({
                    name: team.name,
                    logo: team.logo || '',
                })
                setLogoPreview('')
            } else {
                form.reset({
                    name: '',
                    logo: '',
                })
                setLogoPreview('')
            }
        }
    }, [team, open, form])



    const { mutate: createTeam, isPending: isCreating } = useMutation({
        mutationFn: (data: CreateTeamData) => {
            return TeamService.create(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] })
            onOpenChange(false)
            toast.success('Squadra creata con successo');
        },
    })

    const { mutate: updateTeam, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTeamData }) => {
            return TeamService.update({ id, data })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] })
            onOpenChange(false)
            toast.success('Squadra aggiornata con successo');
        },
    })

    function handleSubmit(values: TeamFormData) {
        const data: CreateTeamData = {
            name: values.name,
            ...(values.logo && { logo: values.logo })
        }

        if (team) {
            updateTeam({ id: team.id, data })
        } else {
            createTeam(data)
        }
    }

    const isPending = isCreating || isUpdating

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <DialogHeader>
                            <DialogTitle>
                                {team ? 'Modifica Squadra' : 'Nuova Squadra'}
                            </DialogTitle>
                            <DialogDescription>
                                {team
                                    ? 'Modifica i dettagli della squadra'
                                    : 'Inserisci i dettagli per creare una nuova squadra'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome squadra</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Es. FC Milano"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="space-y-2">
                                    <FormLabel>Logo (opzionale)</FormLabel>
                                    <FormField
                                        control={form.control}
                                        name="logo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="url"
                                                        placeholder="https://esempio.com/logo.png"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {form.watch('logo') && (
                                        <div className="mt-2 p-2 border rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-2">Anteprima:</p>
                                            <img
                                                src={form.watch('logo')}
                                                alt="Logo preview"
                                                className="w-16 h-16 object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Annulla
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Salvataggio...' : team ? 'Salva' : 'Crea'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
