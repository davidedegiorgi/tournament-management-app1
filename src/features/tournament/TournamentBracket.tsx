import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MatchService } from '../match/match.service'
import type { Tournament } from './tournament.type'
import type { Match } from '../match/match.type'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy, Clock, CheckCircle, Sparkles, Swords } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { MatchScoreDialog } from '../match/MatchScoreDialog'
import { toast } from 'sonner'
import { getLogoUrl } from '@/lib/backend'

type TournamentBracketProps = {
    tournament: Tournament
    onBack: () => void
}

function getRoundName(round: number, totalRounds: number): string {
    const roundFromEnd = totalRounds - round
    switch (roundFromEnd) {
        case 0: return 'Finale'
        case 1: return 'Semifinali'
        case 2: return 'Quarti di Finale'
        case 3: return 'Ottavi di Finale'
        default: return `Round ${round + 1}`
    }
}

export function TournamentBracket({ tournament, onBack }: TournamentBracketProps) {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
    const queryClient = useQueryClient()

    const { data: matches = [], isPending, isError } = useQuery({
        queryKey: ['matches', { tournamentId: tournament.id }],
        queryFn: () => MatchService.getMatches(tournament.id),
    })

    const { mutate: updateMatch, isPending: isUpdating } = useMutation({
        mutationFn: ({ matchId, score1, score2 }: { matchId: number; score1: number; score2: number }) =>
            MatchService.updateMatch(tournament.id, matchId, { score1, score2 }),
        onSuccess: async (response) => {
            // Invalida le query per ricaricare i dati aggiornati
            await queryClient.invalidateQueries({ queryKey: ['matches', { tournamentId: tournament.id }] })
            await queryClient.invalidateQueries({ queryKey: ['tournaments'] })
            await queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] })
            
            setSelectedMatch(null)
            
            // Mostra notifica di successo
            toast.success('Risultato salvato con successo', {
                description: 'Il vincitore è stato avanzato al round successivo'
            })
            
            // Mostra notifica se il torneo è completato
            if (response.tournament_completed && response.tournament_winner_id) {
                setTimeout(() => {
                    toast.success(' Torneo completato!', {
                        description: 'Il campione è stato decretato',
                        duration: 5000,
                    })
                }, 500)
            }
        },
        onError: (error) => {
            toast.error('Errore nel salvataggio del risultato', {
                description: error instanceof Error ? error.message : 'Riprova più tardi'
            })
        }
    })

    // Raggruppa le partite per round
    const matchesByRound = matches.reduce((acc, match) => {
        if (!acc[match.round]) acc[match.round] = []
        acc[match.round].push(match)
        return acc
    }, {} as Record<number, Match[]>)

    const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b)
    const totalRounds = rounds.length

    if (isError) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-destructive">Errore nel caricamento del tabellone</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card className="overflow-hidden">
                <CardHeader className="border-b bg-linear-to-r from-primary/5 to-accent/5">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onBack}
                            className="hover:bg-primary/10 transition-colors"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Trophy className="size-5 text-primary" />
                                </div>
                                {tournament.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {new Date(tournament.date).toLocaleDateString('it-IT', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })} - {tournament.location}
                            </CardDescription>
                        </div>
                        <Badge 
                            variant={tournament.status === 'completed' ? 'outline' : 'default'}
                            className={cn(
                                "px-3 py-1",
                                tournament.status === 'in_progress' && "animate-pulse-ring"
                            )}
                        >
                            {tournament.status === 'completed' ? 'Completato' : tournament.status === 'in_progress' ? 'In corso' : 'In attesa'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {isPending ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="flex flex-col items-center gap-4">
                                <Spinner className="size-12 text-[#00C8FF]" />
                                <p className="text-sm text-muted-foreground">Caricamento tabellone...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Hint per scroll su mobile */}
                            <div className="md:hidden absolute -top-4 right-0 flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
                                <span>Scorri →</span>
                            </div>
                            <div className="overflow-x-auto md:overflow-visible -mx-6 px-6">
                                <div className="flex items-center justify-center gap-1.5 pb-1.5 min-w-max md:min-w-0">
                                {/* Lato sinistro - prima metà dei match di ogni round */}
                                {rounds.slice(0, -1).map((round, roundIndex) => {
                                const roundMatches = matchesByRound[round]?.sort((a, b) => a.position - b.position) || []
                                const halfPoint = Math.ceil(roundMatches.length / 2)
                                const leftMatches = roundMatches.slice(0, halfPoint)
                                
                                return (
                                    <div 
                                        key={`left-${round}`}
                                        className="flex flex-col gap-1 min-w-[170px] md:min-w-[140px] animate-slide-in-right"
                                        style={{ animationDelay: `${roundIndex * 0.1}s` }}
                                    >
                                        <div className="flex items-center gap-1">
                                            <h3 className="font-semibold text-xs">
                                                {getRoundName(round, totalRounds)}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col gap-1" style={{
                                            justifyContent: 'space-around',
                                            minHeight: round > 0 ? `${matchesByRound[0]?.length * 4}rem` : 'auto'
                                        }}>
                                            {leftMatches.map((match, matchIndex) => (
                                                <MatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isFinal={false}
                                                    onClick={() => setSelectedMatch(match)}
                                                    index={matchIndex}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Centro - Finale */}
                            {rounds.length > 0 && (
                                <div 
                                    className="flex flex-col gap-1 min-w-[190px] md:min-w-[160px] animate-scale-in"
                                    style={{ animationDelay: `${(rounds.length - 1) * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-1 justify-center">
                                        <Trophy className="size-3 text-[#00C8FF]" />
                                        <h3 className="font-semibold text-sm text-[#00C8FF]">
                                            {getRoundName(rounds[rounds.length - 1], totalRounds)}
                                        </h3>
                                        <Sparkles className="size-3 text-[#00C8FF] animate-pulse" />
                                    </div>
                                    <div className="flex flex-col gap-1 items-center">
                                        {matchesByRound[rounds[rounds.length - 1]]
                                            ?.sort((a, b) => a.position - b.position)
                                            .map((match, matchIndex) => (
                                                <MatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isFinal={true}
                                                    onClick={() => setSelectedMatch(match)}
                                                    index={matchIndex}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Lato destro - seconda metà dei match di ogni round (in ordine inverso) */}
                            {rounds.slice(0, -1).reverse().map((round, roundIndex) => {
                                const roundMatches = matchesByRound[round]?.sort((a, b) => a.position - b.position) || []
                                const halfPoint = Math.ceil(roundMatches.length / 2)
                                const rightMatches = roundMatches.slice(halfPoint)
                                
                                return (
                                    <div 
                                        key={`right-${round}`}
                                        className="flex flex-col gap-1 min-w-[170px] md:min-w-[140px] animate-slide-in-left"
                                        style={{ animationDelay: `${roundIndex * 0.1}s` }}
                                    >
                                        <div className="flex items-center gap-1">
                                            <h3 className="font-semibold text-xs">
                                                {getRoundName(round, totalRounds)}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col gap-1" style={{
                                            justifyContent: 'space-around',
                                            minHeight: round > 0 ? `${matchesByRound[0]?.length * 4}rem` : 'auto'
                                        }}>
                                            {rightMatches.map((match, matchIndex) => (
                                                <MatchCard
                                                    key={match.id}
                                                    match={match}
                                                    isFinal={false}
                                                    onClick={() => setSelectedMatch(match)}
                                                    index={matchIndex}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                            </div>
                        </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <MatchScoreDialog
                match={selectedMatch}
                open={!!selectedMatch}
                onOpenChange={(open) => !open && setSelectedMatch(null)}
                onSubmit={(score1, score2) => {
                    if (selectedMatch) {
                        updateMatch({ matchId: selectedMatch.id, score1, score2 })
                    }
                }}
                isPending={isUpdating}
            />
        </>
    )
}

type MatchCardProps = {
    match: Match
    isFinal: boolean
    onClick: () => void
    index: number
}

function MatchCard({ match, isFinal, onClick, index }: MatchCardProps) {
    const canEdit = match.team1Id && match.team2Id && match.status !== 'completed'
    const isCompleted = match.status === 'completed'

    return (
        <button
            type="button"
            className={cn(
                "flex flex-col gap-1.5 p-1.5 border rounded-md transition-all text-left group animate-slide-up backdrop-blur-sm",
                "bg-white dark:bg-[#0a1442]",
                "border-border/50 dark:border-[#00C8FF]/30",
                isFinal && "border-[#00C8FF]/50 dark:border-[#00C8FF]/70 shadow-md dark:shadow-lg shadow-[#00C8FF]/20 dark:shadow-[#00C8FF]/50",
                canEdit && "hover:border-[#00C8FF] hover:shadow-lg dark:hover:shadow-xl hover:shadow-[#00C8FF]/30 dark:hover:shadow-[#00C8FF]/60 hover:-translate-y-0.5 cursor-pointer dark:hover:border-[#00C8FF]",
                !canEdit && "cursor-default",
                isCompleted && "bg-slate-50 dark:bg-[#0a1442] dark:border-[#00C8FF]/40"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={canEdit ? onClick : undefined}
            disabled={!canEdit}
        >
            <div className="flex items-center justify-between text-[10px] font-medium">
                <span className="flex items-center gap-0.5 text-[#00C8FF]">
                    <Swords className="size-2" />
                    M{match.position + 1}
                </span>
                {isCompleted ? (
                    <CheckCircle className="size-2 text-[#00C8FF]" />
                ) : match.team1Id && match.team2Id ? (
                    <Clock className="size-2 animate-pulse text-orange-500" />
                ) : null}
            </div>
            <div className="flex flex-col gap-1">
                <TeamRow
                    name={match.team1?.name}
                    logo={match.team1?.logo}
                    score={match.score1}
                    isWinner={isCompleted && match.winnerId === match.team1Id}
                />
                <div className="h-px bg-[#00C8FF]/30" />
                <TeamRow
                    name={match.team2?.name}
                    logo={match.team2?.logo}
                    score={match.score2}
                    isWinner={isCompleted && match.winnerId === match.team2Id}
                />
            </div>
        </button>
    )
}

type TeamRowProps = {
    name?: string
    score?: number
    isWinner: boolean
    logo?: string
}

function TeamRow({ name, score, isWinner, logo }: TeamRowProps) {
    return (
        <div className={cn(
            "flex items-center justify-between p-1 rounded transition-all",
            isWinner && "bg-[#00C8FF]/20 ring-1 ring-[#00C8FF]/50",
            !isWinner && "hover:bg-muted/50"
        )}>
            <div className="flex items-center gap-1 flex-1 min-w-0">
                {logo ? (
                    <div className="size-5 rounded bg-white dark:bg-[#0a1442] p-0.5 flex items-center justify-center shrink-0 border border-[#00C8FF]/30 dark:border-[#00C8FF]/50">
                        <img
                            src={getLogoUrl(logo)}
                            alt={name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none'
                            }}
                        />
                    </div>
                ) : (
                    <div className="size-5 rounded bg-muted flex items-center justify-center shrink-0">
                        <Trophy className="size-2.5 text-muted-foreground" />
                    </div>
                )}
                <span className={cn(
                    "truncate text-[10px] font-medium",
                    !name && "text-muted-foreground italic",
                    isWinner && "font-bold text-[#00C8FF]"
                )}>
                    {name || 'TBD'}
                </span>
            </div>
            {score !== undefined && score !== null && (
                <span className={cn(
                    "font-mono font-bold text-sm min-w-[1.5rem] text-right tabular-nums",
                    isWinner && "text-[#00C8FF]"
                )}>{score}</span>
            )}
        </div>
    )
}
