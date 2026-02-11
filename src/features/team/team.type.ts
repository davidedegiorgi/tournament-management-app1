export type Team = {
    id: number
    name: string
    logo?: string
    createdAt: string
    hasParticipated: boolean
}

export type CreateTeamData = {
    name: string
    logo?: string
}

export type UpdateTeamData = {
    name?: string
    logo?: string
}
