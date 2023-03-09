import * as events from '../interfaces/events'
import { IGameState } from '../Game'
import { renameObjectKeys } from "../Utilities"
import { Info } from "../interfaces/LogstfInterfaces"


interface IInfo {
    mapName: string | undefined
    supplemental: boolean
    totalLength: number
    hasRealDamage: boolean
    hasWeaponDamage: boolean
    hasAccuracy: boolean
    hasHealthPack: boolean
    hasHealthPackReal: boolean
    hasHeadshot: boolean //Headshot
    hasHeadshotHit: boolean
    hasBackstab: boolean //Backstab?
    hasCapturePoint: boolean //Capture point
    hasBuildingsBuilt: boolean
    hasDamageTaken: boolean //Damage taken
    hasAirshot: boolean // Airshot
    hasHealingReceived: boolean
    hasIntel: boolean //CTF mode
    hasAttackDefenseScoring: boolean //Attack-defense
    notifications: string[]
    title: string | undefined
    date: number | undefined
    uploader: {
        id: string | undefined
        name: string | undefined
        info: string | undefined
    }
}

class InfoModule implements events.IStats {
    public identifier: string
    private gameState: IGameState
    private info: IInfo

    constructor(gameState: IGameState) {
        this.identifier = 'info'
        this.gameState = gameState
        this.info = this.defaultInfo()
    }

    private defaultInfo = (): IInfo => ({
        mapName: undefined,
        supplemental: false,
        totalLength: -1,
        hasRealDamage: false,
        hasWeaponDamage: false,
        hasAccuracy: false,
        hasHealthPack: false,
        hasHealthPackReal: false,
        hasHeadshot: false,
        hasHeadshotHit: false,
        hasBackstab: false,
        hasCapturePoint: false,
        hasBuildingsBuilt: false,
        hasDamageTaken: false,
        hasAirshot: false,
        hasHealingReceived: false,
        hasIntel: false,
        hasAttackDefenseScoring: false,
        notifications: [],
        title: undefined,
        date: undefined,
        uploader: {
            id: undefined,
            name: undefined,
            info: undefined
        }
    })

    onCapture(event: events.ICaptureEvent) {
        if (!this.gameState.isLive) return
        if (!this.info.hasCapturePoint)
            this.info.hasCapturePoint = true
    }


    onMapLoad(event: events.IMapLoadEvent) {
        this.info.mapName = event.mapName
    }

    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return
        if (event.airshot) this.info.hasAirshot = true
        if (event.realDamage) this.info.hasRealDamage = true
        //TODO: Some logs are weird and should have both but only have one 3265990
        if (event.headshot) this.info.hasHeadshotHit = true
        if (event.damage) {
            this.info.hasWeaponDamage = true
            this.info.hasDamageTaken = true
        }
    }

    onBuild(event: events.IBuildEvent) {
        if (!this.gameState.isLive) return
        if (!this.info.hasBuildingsBuilt)
            this.info.hasBuildingsBuilt = true
    }
    onHeal(event: events.IHealEvent) {
        if (!this.gameState.isLive) return
        if (event.healing) this.info.hasHealingReceived = true
    }

    onPickup(event: events.IPickupEvent) {
        if (!this.gameState.isLive) return
        if (event.healing) {
            this.info.hasHealthPack = true
            this.info.hasHealthPackReal = true
        }
    }

    onFlag(event: events.IFlagEvent) {
        if (!this.gameState.isLive) return
        if (!this.info.hasIntel) this.info.hasIntel = true
    }

    onShotHit(event: events.IShotHitEvent) {
        if (!this.gameState.isLive) return
        if (!this.info.hasAccuracy)
            this.info.hasAccuracy = true
    }

    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        if (event.feignDeath) return
        if (event.backstab) this.info.hasBackstab = true
        if (event.headshot) this.info.hasHeadshot = true
    }

    onMiniRoundWin(event: events.IMiniRoundWin) {
        if (!this.info.hasAttackDefenseScoring)
            this.info.hasAttackDefenseScoring = true
    }

    finish() {

    }

    toJSON(): IInfo {
        return this.info
    }

    toLogstf(length: number | undefined): Info {
        if (length)
            this.info.totalLength = length
        return renameObjectKeys(this.info, new Map([
            ["mapName", "map"],
            ["supplemental", "supplemental"],
            ["totalLength", "total_length"],
            ["hasRealDamage", "hasRealDamage"],
            ["hasWeaponDamage", "hasWeaponDamage"],
            ["hasAccuracy", "hasAccuracy"],
            ["hasHealthPack", "hasHP"],
            ["hasHealthPackReal", "hasHP_real"],
            ["hasHeadshot", "hasHS"],
            ["hasHeadshotHit", "hasHS_hit"],
            ["hasBackstab", "hasBS"],
            ["hasCapturePoint", "hasCP"],
            ["hasBuildingsBuilt", "hasSB"],
            ["hasDamageTaken", "hasDT"],
            ["hasAirshot", "hasAS"],
            ["hasHealingReceived", "hasHR"],
            ["hasIntel", "hasIntel"],
            ["hasAttackDefenseScoring", "AD_scoring"],
            ["notifications", "notifications"],
            ["title", "title"],
            ["date", "date"],
            ["uploader", "uploader"]
        ]))
    }

}

export default InfoModule