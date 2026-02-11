import { useState } from "react";
import type { Tournament } from "@/features/tournament/tournament.type";
import { TournamentList } from "@/features/tournament/TournamentList";
import { TournamentForm } from "@/features/tournament/TournamentForm";
import { TournamentBracket } from "@/features/tournament/TournamentBracket";

export function TournamentsPage() {
    const [isTournamentFormOpen, setIsTournamentFormOpen] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

    // Se c'è un torneo selezionato, mostra il bracket
    if (selectedTournament) {
        return (
            <div className="animate-scale-in">
                <TournamentBracket
                    tournament={selectedTournament}
                    onBack={() => setSelectedTournament(null)}
                />
            </div>
        );
    }

    return (
        <div className="animate-scale-in">
            <TournamentList
                onCreate={() => setIsTournamentFormOpen(true)}
                onSelect={setSelectedTournament}
            />

            <TournamentForm
                open={isTournamentFormOpen}
                onOpenChange={setIsTournamentFormOpen}
            />
        </div>
    );
}
