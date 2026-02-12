
import React from "react"

import { useQuery } from '@tanstack/react-query'
import { TournamentService } from '../tournament/tournament.service'
import { TeamService } from '../team/team.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Trophy, Users, Medal, Calendar, Crown, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLogoUrl } from '@/lib/backend'

export function Dashboard() {
    const { data: tournaments = [], isPending: isLoadingTournaments } = useQuery({
        queryKey: ['tournaments'],
        queryFn: () => TournamentService.list(),
    })

    const { data: teams = [], isPending: isLoadingTeams } = useQuery({
        queryKey: ['teams'],
        queryFn: () => TeamService.list(),
    })

    const tournamentsArray = Array.isArray(tournaments) ? tournaments : []
    const teamsArray = Array.isArray(teams) ? teams : []

    const completedTournaments = tournamentsArray.filter(t => t.status === 'completed')
    const activeTournaments = tournamentsArray.filter(t => t.status === 'in_progress')
    const isPending = isLoadingTournaments || isLoadingTeams

    // Mostra loader centralizzato durante il caricamento iniziale
    if (isPending && tournamentsArray.length === 0 && teamsArray.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="size-12 text-[#00C8FF]" />
                    <p className="text-sm text-muted-foreground">Caricamento dashboard...</p>
                </div>
            </div>
        )
    }

    // Calcola statistiche vincitori con logo
    const winnerStats = completedTournaments.reduce((acc, tournament) => {
        if (tournament.winner) {
            const key = tournament.winner.name
            if (!acc[key]) {
                acc[key] = { 
                    name: tournament.winner.name, 
                    logo: tournament.winner.logo,
                    wins: 0 
                }
            }
            acc[key].wins += 1
        }
        return acc
    }, {} as Record<string, { name: string; logo?: string; wins: number }>)

    const topWinners = Object.values(winnerStats)
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 5)

    return (
        <div className="space-y-6">
            {/* Statistiche principali */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                <StatCard
                    title="Tornei Totali"
                    value={tournamentsArray.length}
                    icon={Trophy}
                    isPending={isPending}
                    color="primary"
                />
                <StatCard
                    title="Tornei Completati"
                    value={completedTournaments.length}
                    icon={Medal}
                    isPending={isPending}
                    color="accent"
                />
                <StatCard
                    title="Tornei Attivi"
                    value={activeTournaments.length}
                    icon={Flame}
                    isPending={isPending}
                    color="destructive"
                    pulse={activeTournaments.length > 0}
                />
                <StatCard
                    title="Squadre Registrate"
                    value={teamsArray.length}
                    icon={Users}
                    isPending={isPending}
                    color="secondary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Storico tornei completati */}
                <Card className="card-hover overflow-hidden">
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Trophy className="size-4 text-primary" />
                            </div>
                            Storico Tornei
                        </CardTitle>
                        <CardDescription>Tornei completati e i loro vincitori</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className={cn(
                            "divide-y min-h-[200px]",
                            !isPending && completedTournaments.length > 4 && 'max-h-72 overflow-y-auto',
                            isPending && 'p-4 space-y-3'
                        )}>
                            {isPending && new Array(4).fill('').map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-16 rounded-lg"
                                    style={{ animationDelay: 0.1 * i + 's' }}
                                />
                            ))}

                            {!isPending && completedTournaments.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Calendar className="size-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground">
                                        Nessun torneo completato ancora
                                    </p>
                                </div>
                            )}

                            {completedTournaments.map((tournament, index) => (
                                <div
                                    key={tournament.id}
                                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors animate-slide-up"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div>
                                        <p className="font-medium">{tournament.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(tournament.date).toLocaleDateString('it-IT', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {tournament.winner && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-sm">
                                            <Trophy className="size-4 text-black dark:text-accent" />
                                            <span className="font-semibold text-black dark:text-accent-foreground">{tournament.winner.name}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Classifica vincitori */}
                <Card className="card-hover overflow-hidden">
                    <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Crown className="size-4 text-black dark:text-accent" />
                            </div>
                            Hall of Fame
                        </CardTitle>
                        <CardDescription>Squadre con piu tornei vinti</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className={cn(
                            "divide-y min-h-[200px]",
                            !isPending && topWinners.length > 4 && 'max-h-72 overflow-y-auto',
                            isPending && 'p-4 space-y-3'
                        )}>
                            {isPending && new Array(4).fill('').map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-12 rounded-lg"
                                    style={{ animationDelay: 0.1 * i + 's' }}
                                />
                            ))}

                            {!isPending && topWinners.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Medal className="size-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground">
                                        Nessun vincitore ancora
                                    </p>
                                </div>
                            )}

                            {topWinners.map((winner, index) => (
                                <div
                                    key={winner.name}
                                    className={cn(
                                        "flex items-center justify-between p-4 transition-all animate-slide-up",
                                        index === 0 && "bg-accent/10 dark:bg-[#0a1442]"
                                    )}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "size-10 rounded-full flex items-center justify-center text-sm font-bold transition-transform hover:scale-110",
                                            index === 0 && "bg-yellow-400 dark:bg-amber-500 text-white shadow-lg winner-glow",
                                            index === 1 && "bg-slate-300 dark:bg-slate-400 text-white",
                                            index === 2 && "bg-amber-600 dark:bg-amber-700 text-white",
                                            index > 2 && "bg-muted text-muted-foreground"
                                        )}>
                                            {index === 0 ? <Crown className="size-5" /> : index + 1}
                                        </div>
                                        {winner.logo && (
                                            <div className="size-10 rounded-lg bg-white/50 dark:bg-[#0a1442] p-1.5 flex items-center justify-center border border-[#00C8FF]/30">
                                                <img
                                                    src={getLogoUrl(winner.logo)}
                                                    alt={winner.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none'
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <span className={cn(
                                            "font-medium",
                                            index === 0 && "text-lg"
                                        )}>{winner.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "text-sm font-semibold px-3 py-1 rounded-full",
                                            index === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                                        )}>
                                            {winner.wins} {winner.wins === 1 ? 'vittoria' : 'vittorie'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

type StatCardProps = {
    title: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    isPending: boolean
    color: 'primary' | 'accent' | 'destructive' | 'secondary'
    pulse?: boolean
}

function StatCard({ title, value, icon: Icon, isPending, color, pulse }: StatCardProps) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        destructive: 'bg-destructive/10 text-destructive',
        secondary: 'bg-secondary text-secondary-foreground',
    }

    return (
        <Card className="card-hover overflow-hidden group">
            <CardContent className="p-6 relative">
                <div className="absolute inset-0 bg-linear-to-br from-transparent to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        {isPending ? (
                            <Skeleton className="h-9 w-16 mt-1" />
                        ) : (
                            <p className="text-4xl font-bold tracking-tight mt-1">{value}</p>
                        )}
                    </div>
                    <div className={cn(
                        "size-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                        colorClasses[color],
                        pulse && "animate-pulse-ring"
                    )}>
                        <Icon className="size-7" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
