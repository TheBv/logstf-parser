export interface Team {
    score: number;
    kills: number;
    deaths: number;
    dmg: number;
    charges: number;
    drops: number;
    firstcaps: number;
    caps: number;
}

export interface Teams {
    Red: Team;
    Blue: Team;
}

export interface ClassStat {
    type: string;
    kills: number;
    assists: number;
    deaths: number;
    dmg: number;
    weapon: Weapon;
    total_time: number;
}

export interface Weapon {
    [key: string]: WeaponStats
}

export interface WeaponStats {
    kills: number
    dmg: number
    avg_dmg: number
    shots: number
    hits: number
}

export interface Player {
    team: string;
    class_stats: ClassStat[] | undefined;
    kills: number;
    deaths: number;
    assists: number;
    suicides: number;
    kapd: string;
    kpd: string;
    dmg: number;
    dmg_real: number | undefined;
    dt: number;
    dt_real: number | undefined;
    hr: number;
    lks: number;
    as: number;
    dapd: number;
    dapm: number;
    ubers: number;
    ubertypes: Ubertypes;
    drops: number;
    medkits: number;
    medkits_hp: number;
    backstabs: number;
    headshots: number;
    headshots_hit: number;
    sentries: number;
    heal: number;
    cpc: number;
    ic: number;
    medicstats: Medicstats | undefined
}

export interface Ubertypes {
    [key: string]: number
}

export interface Medicstats {
    advantages_lost: number;
    biggest_advantage_lost: number;
    deaths_within_20s_after_uber: number;
    deaths_with_95_99_uber: number;
    avg_time_before_healing: number;
    avg_time_to_build: number;
    avg_time_before_using: number;
    avg_uber_length: number;
}

export interface Players {
    [key: string]: Player;
}

export interface Names {
    [key: string]: string;
}

export interface RoundTeam {
    score: number;
    kills: number;
    dmg: number;
    ubers: number;
}

export interface RoundTeams {
    Blue: RoundTeam;
    Red: RoundTeam;
}

export interface RoundEvent {
    type: string;
    time: number;
    team: string;
    point: number | undefined;
    medigun: string | undefined;
    steamid: string | undefined;
    killer: string | undefined;
}

export interface Round {
    start_time: number;
    winner: string;
    team: RoundTeams;
    events: RoundEvent[];
    players: RoundPlayers;
    firstcap: string;
    length: number;
}

export interface RoundPlayers {
    [key: string]: RoundPlayerData
}

export interface RoundPlayerData {
    team: string,
    kills: number,
    dmg: number
}

export interface Healspread {
    [key: string]: { [key: string]: number }
}

export interface ClassData {
    [key: string]: ClassSubData
}

export interface ClassSubData {
    [key: string]: number
}

export interface Chat {
    steamid: string;
    name: string;
    msg: string;
}

export interface Uploader {
    id: string | undefined;
    name: string | undefined;
    info: string | undefined;
}

export interface Info {
    map: string | undefined;
    supplemental: boolean;
    total_length: number;
    hasRealDamage: boolean;
    hasWeaponDamage: boolean;
    hasAccuracy: boolean;
    hasHP: boolean;
    hasHP_real: boolean;
    hasHS: boolean;
    hasHS_hit: boolean;
    hasBS: boolean;
    hasCP: boolean;
    hasSB: boolean;
    hasDT: boolean;
    hasAS: boolean;
    hasHR: boolean;
    hasIntel: boolean;
    AD_scoring: boolean;
    notifications: any[];
    title: string | undefined;
    date: number | undefined;
    uploader: Uploader;
}

export interface Killstreak {
    steamid: string;
    streak: number;
    time: number;
}

export interface Log {
    version: number;
    teams: Teams | undefined;
    length: number | undefined;
    players: Players | undefined;
    names: Names | undefined;
    rounds: Round[] | undefined;
    healspread: Healspread | undefined;
    classkills: ClassData | undefined;
    classdeaths: ClassData | undefined;
    classkillassists: ClassData | undefined;
    chat: Chat[] | undefined;
    info: Info | undefined;
    killstreaks: Killstreak[] | undefined;
    success: boolean;
}
