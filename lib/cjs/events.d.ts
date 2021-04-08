import { PlayerInfo } from './Game';
export declare enum Role {
    Scout = "scout",
    Soldier = "soldier",
    Pyro = "pyro",
    Demoman = "demoman",
    Heavy = "heavyweapons",
    Engineer = "engineer",
    Medic = "medic",
    Sniper = "sniper",
    Spy = "spy"
}
export declare enum Team {
    Red = "Red",
    Blue = "Blue",
    Spectator = "Spectator"
}
export interface IStats {
    [index: string]: any;
    identifier: string;
    onKill?(event: IKillEvent): void;
    onDamage?(event: IDamageEvent): void;
    onHeal?(event: IHealEvent): void;
    onShot?(event: IShotEvent): void;
    onShotHit?(event: IShotHitEvent): void;
    onAssist?(event: IAssistEvent): void;
    onPickup?(event: IPickupEvent): void;
    onSuicide?(event: ISuicideEvent): void;
    onRole?(event: IRoleEvent): void;
    onSpawn?(event: ISpawnEvent): void;
    onCapture?(event: ICaptureEvent): void;
    onMedicDeath?(event: IMedicDeathEvent): void;
    onRoundStart?(event: IRoundStartEvent): void;
    onRoundEnd?(event: IRoundEndEvent): void;
    onScore?(event: IRoundScoreEvent): void;
    onGameOver?(event: IGameOverEvent): void;
    onJoinTeam?(event: IJoinTeamEvent): void;
    onDisconnect?(event: IDisconnectEvent): void;
    onCharge?(event: IChargeEvent): void;
    onChat?(event: IChatEvent): void;
    onBuild?(event: IBuildEvent): void;
    onPause?(event: IPauseEvent): void;
    onUnpause?(event: IUnpauseEvent): void;
    onMapLoad?(event: IMapLoadEvent): void;
}
export interface IEvent {
    timestamp: number;
}
export interface IKillEvent extends IEvent {
    attacker: PlayerInfo;
    victim: PlayerInfo;
    weapon: string | undefined;
    headshot: boolean;
    backstab: boolean;
    airshot: boolean;
}
export interface IDamageEvent extends IEvent {
    attacker: PlayerInfo;
    victim: PlayerInfo | null;
    damage: number;
    weapon: string | undefined;
    headshot: boolean;
    airshot: boolean;
}
export interface IHealEvent extends IEvent {
    healer: PlayerInfo;
    target: PlayerInfo;
    healing: number;
}
export interface IShotEvent extends IEvent {
    player: PlayerInfo;
    weapon: string;
}
export interface IShotHitEvent extends IEvent {
    player: PlayerInfo;
    weapon: string;
}
export interface IAssistEvent extends IEvent {
    assister: PlayerInfo;
    victim: PlayerInfo;
    attackerPosition: string | null;
    assisterPosition: string | null;
    victimPosition: string | null;
}
export interface IPickupEvent extends IEvent {
    item: string;
}
export interface ISuicideEvent extends IEvent {
    player: PlayerInfo;
}
export interface IRoleEvent extends IEvent {
    player: PlayerInfo;
    role: Role;
}
export interface ISpawnEvent extends IEvent {
    player: PlayerInfo;
    role: Role;
}
export interface ICaptureEvent extends IEvent {
    team: Team;
    pointId: number;
    pointName: string;
    numCappers: number;
    playerIds: string[];
}
export interface IMedicDeathEvent extends IEvent {
    attacker: PlayerInfo;
    victim: PlayerInfo;
    isDrop: boolean;
}
export interface IRoundStartEvent extends IEvent {
}
export interface IRoundEndEvent extends IEvent {
    type: "Win" | "Stalemate";
    winner: Team | null;
}
export interface IRoundLengthEvent extends IEvent {
    lengthInSeconds: number;
}
export interface IRoundScoreEvent extends IEvent {
    team: Team;
    score: number;
}
export interface IGameOverEvent extends IEvent {
    reason: string;
}
export interface IJoinTeamEvent extends IEvent {
    player: PlayerInfo;
    newTeam: Team;
}
export interface IDisconnectEvent extends IEvent {
    player: PlayerInfo;
}
export interface IChargeEvent extends IEvent {
    player: PlayerInfo;
    medigunType: string;
}
export interface IChatEvent extends IEvent {
    player: PlayerInfo;
    message: string;
}
export interface IBuildEvent extends IEvent {
    player: PlayerInfo;
    builtObject: string;
    position: string;
}
export interface IPauseEvent extends IEvent {
}
export interface IUnpauseEvent extends IEvent {
}
export interface IMapLoadEvent extends IEvent {
    mapName: string;
}
