import { PlayerInfo } from './Game'

export enum Role {
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

export enum Team {
    Red = "Red",
    Blue = "Blue",
    Spectator = "Spectator",
}

export enum FlagEvent {
    Dropped = "dropped",
    PickedUp = "picked up",
    Captured = "captured",
    Defended = "defended"
}

export enum Building {
    Sentry = "OBJ_SENTRYGUN",
    Dispenser = "OBJ_DISPENSER",
    Teleporter = "OBJ_TELEPORTER"
}

export interface IStats {
    [index: string] : any
    identifier: string
    onKill?(event: IKillEvent): void
    onDamage?(event: IDamageEvent): void
    onHeal?(event: IHealEvent): void
    onShot?(event: IShotEvent): void
    onShotHit?(event: IShotHitEvent): void
    onAssist?(event: IAssistEvent): void
    onPickup?(event: IPickupEvent): void
    onSuicide?(event: ISuicideEvent): void
    onRole?(event: IRoleEvent): void
    onSpawn?(event: ISpawnEvent): void
    onCapture?(event: ICaptureEvent): void
    onFlag?(event: IFlagEvent): void
    onMedicDeath?(event: IMedicDeathEvent): void
    onRoundStart?(event: IRoundStartEvent): void
    onRoundEnd?(event: IRoundEndEvent): void
    onScore?(event: IRoundScoreEvent): void
    onGameOver?(event: IGameOverEvent): void
    onJoinTeam?(event: IJoinTeamEvent):void
    onDisconnect?(event: IDisconnectEvent):void
    onCharge?(event: IChargeEvent):void
    onChat?(event: IChatEvent):void
    onBuild?(event: IBuildEvent):void
    onObjectDestroyed?(event : IObjectDestroyedEvent):void
    onPause?(event: IPauseEvent):void
    onUnpause?(event: IUnpauseEvent):void
    onMapLoad?(event: IMapLoadEvent):void
    onFirstHeal?(event: IFirstHealEvent):void
    onChargeReady?(event: IChargeReadyEvent):void
    onChargeEnded?(event: IChargeEndedEvent):void
    onMedicDeathEx?(event: IMedicDeathExEvent):void
    onEmptyUber?(event: IEmptyUberEvent):void
    onLostUberAdv?(event: ILostUberAdvantageEvent):void
}

export interface IEvent {
    timestamp: number
}

export interface IKillEvent extends IEvent {
    attacker: PlayerInfo
    victim: PlayerInfo
    weapon: string | undefined
    headshot: boolean
    backstab: boolean
    airshot: boolean
}

export interface IDamageEvent extends IEvent {
    attacker: PlayerInfo
    victim: PlayerInfo | null
    damage: number
    weapon: string | undefined
    headshot: boolean
    airshot: boolean
}

export interface IHealEvent extends IEvent {
    healer: PlayerInfo
    target: PlayerInfo
    healing: number
}

export interface IShotEvent extends IEvent {
    player: PlayerInfo
    weapon: string
}

export interface IShotHitEvent extends IEvent {
    player: PlayerInfo
    weapon: string
}

export interface IAssistEvent extends IEvent {
    assister: PlayerInfo
    victim: PlayerInfo
    attackerPosition: string | null
    assisterPosition: string | null
    victimPosition: string | null
}

export interface IPickupEvent extends IEvent {
    player: PlayerInfo
    item: string
    healing: number | null
}

export interface IFlagEvent extends IEvent{
    player: PlayerInfo
    type: FlagEvent
    position: string | null
}

export interface ISuicideEvent extends IEvent {
    player: PlayerInfo
}

export interface IRoleEvent extends IEvent {
    player: PlayerInfo
    role: Role
}

export interface ISpawnEvent extends IEvent {
    player: PlayerInfo
    role: Role
}

export interface ICaptureEvent extends IEvent {
    team: Team,
    pointId: number,
    pointName: string,
    numCappers: number,
    players: PlayerInfo[]
}

export interface IMedicDeathEvent extends IEvent {
    attacker: PlayerInfo
    victim: PlayerInfo
    isDrop: boolean
}

export interface IMedicDeathExEvent extends IEvent{
    player: PlayerInfo,
    uberpct: number
}

export interface IRoundStartEvent extends IEvent {

}

export interface IRoundEndEvent extends IEvent {
    type: "Win" | "Stalemate"
    winner: Team | null
}

export interface IRoundLengthEvent extends IEvent {
    lengthInSeconds: number
}

export interface IRoundScoreEvent extends IEvent {
    team: Team
    score: number
}

export interface IGameOverEvent extends IEvent {
    reason: string
}

export interface IJoinTeamEvent extends IEvent {
    player: PlayerInfo
    newTeam: Team
}

export interface IDisconnectEvent extends IEvent {
    player: PlayerInfo
    reason: string
}

export interface IChargeEvent extends IEvent {
    player: PlayerInfo,
    medigunType: string
}

export interface IFirstHealEvent extends IEvent{
    player: PlayerInfo,
    time: number
}

export interface IChargeReadyEvent extends IEvent{
    player: PlayerInfo,
}

export interface IChargeEndedEvent extends IEvent{
    player: PlayerInfo,
    duration: number
}

export interface IEmptyUberEvent extends IEvent{
    player: PlayerInfo,
}

export interface ILostUberAdvantageEvent extends IEvent{
    player: PlayerInfo,
    time: number
}

export interface IChatEvent extends IEvent {
    player: PlayerInfo
    message: string
}

export interface IBuildEvent extends IEvent {
    player: PlayerInfo
    builtObject: Building
    position: string | null
}

export interface IObjectDestroyedEvent extends IEvent{
    attacker: PlayerInfo
    builtObject: Building
    objectOwner: PlayerInfo
    weapon: string | undefined
    attackerPosition: string | null
    assist: boolean
    assistPositon: string | null
}

export interface IPauseEvent extends IEvent {}
export interface IUnpauseEvent extends IEvent {}
export interface IMapLoadEvent extends IEvent {
    mapName: string
}