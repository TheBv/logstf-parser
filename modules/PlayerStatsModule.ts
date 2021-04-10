import { createSecurePair } from "tls"
import * as events from '../events'
import { IGameState, PlayerInfo } from '../Game'

//TODO averageDamage, averageTimeBeforeHealong, avgTimeToBuild, deathsAfterUber, averageTimeBeforeUsing
//We need to keep track of the time when the medic last used, last got their uber (reset if death)
//TODO uberLengths sometimes empty?
//TODO add Ubercharges/medic deaths to events
//TODO seperate player stats per round
interface IMedicStats{
    advantagesLost: number,
    biggestAdvantageLost: number,
    nearFullChargeDeaths: number,
    deathsAfterUber: number,
    timeBeforeHealing : number[],
    avgTimeBeforeHealing: number,
    timeToBuild: number[]
    avgTimeToBuild: number,
    uberLengths: number[],
    avgUberLength: number
}

interface IPlayerStats {
    team: string | null
    kills: number
    assists: number
    deaths: number
    damage: number
    suicides: number
    damageTaken: number
    charges: number
    chargesByType: {[index: string] : number}
    drops: number
    airshots: number
    sentriesBuilt: number
    sentriesDestroyed: number
    headshots: number
    headshotKills: number
    healing: number
    healingReceived: number
    medkits: number
    medkitsHp : number
    backstabs: number
    capturesPoint: number
    capturesIntel: number
    longestKillStreak: number
    currentKillStreak: number
    medicstats: IMedicStats | null
}


class PlayerStatsModule implements events.IStats {
    public identifier: string
    private players: {[id:string]: IPlayerStats}
    private gameState: IGameState

    constructor(gameState: IGameState) {
        this.identifier = 'players'
        this.players = {}
        this.gameState = gameState
    }

    private defaultPlayer = (): IPlayerStats => ({
        team: null,
        kills: 0,
        assists: 0,
        deaths: 0,
        damage: 0,
        suicides: 0,
        damageTaken: 0,
        charges: 0,
        chargesByType: {},
        drops: 0,
        airshots: 0,
        sentriesBuilt: 0,
        sentriesDestroyed: 0,
        headshots: 0,
        headshotKills: 0,
        healing: 0,
        healingReceived: 0,
        medkits: 0,
        medkitsHp : 0,
        backstabs: 0,
        capturesPoint: 0,
        capturesIntel: 0,
        longestKillStreak: 0,
        currentKillStreak: 0,
        medicstats: null,
    })
        
    private defaultMedicStats = (): IMedicStats => ({
        advantagesLost: 0,
        biggestAdvantageLost: 0,
        nearFullChargeDeaths: 0,
        deathsAfterUber: 0,
        timeBeforeHealing: [],
        avgTimeBeforeHealing: 0,
        timeToBuild: [],
        avgTimeToBuild: 0,
        uberLengths: [],
        avgUberLength: 0
    })

    private getOrCreatePlayer(player: PlayerInfo): IPlayerStats {
        if (!(player.id in this.players)) {
            this.players[player.id] = this.defaultPlayer()
        }
        let playerInstance = this.players[player.id]
        if (!playerInstance) throw new Error()
        playerInstance.team = player.team
        return playerInstance
    }


    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)
        const victim: IPlayerStats = this.getOrCreatePlayer(event.victim)

        attacker.kills++
        attacker.currentKillStreak++

        if (event.headshot) attacker.headshots++
        if (event.backstab) attacker.backstabs++
        
        victim.deaths++
        victim.longestKillStreak = Math.max(victim.currentKillStreak, victim.longestKillStreak)
        victim.currentKillStreak = 0
    }

    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)

        attacker.damage += event.damage
        if (event.headshot) attacker.headshots += 1
        if (event.airshot) attacker.airshots += 1

        if (event.victim) {
            const victim: IPlayerStats = this.getOrCreatePlayer(event.victim)
            if (victim) {
                victim.damageTaken += event.damage
            }
        }
    }
    onCapture(event: events.ICaptureEvent){
        if (!this.gameState.isLive) return
        for (const playerInfo of event.players){
            const player: IPlayerStats = this.getOrCreatePlayer(playerInfo)
            player.capturesPoint += 1
        }
    }
    onFlag(event: events.IFlagEvent){
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        if (event.event == events.FlagEvent.Captured){
            player.capturesIntel += 1
        }
    }
    onPickup(event: events.IPickupEvent){
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        if (event.healing){
            player.medkitsHp += event.healing
            switch (event.item){
                case("medkit_medium"):
                    player.medkits += 2
                    break;
                case("medkit_large"):
                    player.medkits += 4
                    break;
                default:
                    player.medkits += 1
                    break;
            }
        }
    }
    onHeal(event: events.IHealEvent) {
        if (!this.gameState.isLive) return
        const healer: IPlayerStats = this.getOrCreatePlayer(event.healer)
        const target: IPlayerStats = this.getOrCreatePlayer(event.target)

        healer.healing += event.healing
        target.healingReceived += event.healing
    }
    onBuild(event: events.IBuildEvent){
        if (!this.gameState.isLive) return
        if (event.builtObject == events.Building.Sentry){
            const player: IPlayerStats = this.getOrCreatePlayer(event.player)
            player.sentriesBuilt += 1
        }  
    }
    onObjectDestroyed(event: events.IObjectDestroyed){
        if (!this.gameState.isLive) return
        if (event.builtObject ==events.Building.Sentry){
            const player: IPlayerStats = this.getOrCreatePlayer(event.attacker)
            player.sentriesDestroyed += 1
        }
    }
    onAssist(event: events.IAssistEvent) {
        if (!this.gameState.isLive) return
        const assister: IPlayerStats = this.getOrCreatePlayer(event.assister)
        assister.assists += 1
    }

    onSuicide(event: events.ISuicideEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        player.deaths += 1
        player.suicides += 1
    }


    //Medic specific events

    onCharge(event: events.IChargeEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        player.charges += 1
        if (!(event.medigunType in player.chargesByType)) {
            player.chargesByType[event.medigunType] = 0
        }
        player.chargesByType[event.medigunType] += 1
    }

    onLostUberAdv(event: events.ILostUberAdvantageEvent){
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        if (!player.medicstats){
            player.medicstats = this.defaultMedicStats()
        }
        player.medicstats.advantagesLost += 1
        player.medicstats.biggestAdvantageLost = Math.max(player.medicstats.biggestAdvantageLost, event.time)
    }

    onMedicDeath(event: events.IMedicDeathEvent){
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)
        const victim: IPlayerStats = this.getOrCreatePlayer(event.victim)
        if(event.isDrop)
            victim.drops += 1;
    }

    onMedicDeathEx(event: events.IMedicDeathExEvent){
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        if (!player.medicstats){
            player.medicstats = this.defaultMedicStats()
        }
        if(event.uberpct >= 95){
            player.medicstats.nearFullChargeDeaths += 1
        }
    }

    onChargeEnded(event: events.IChargeEndedEvent){
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        if (!player.medicstats){
            player.medicstats = this.defaultMedicStats()
        }
        player.medicstats.uberLengths.push(event.duration)
    }

    finish(): void {
        for(const player of Object.values(this.players)){
            const stats = player.medicstats;
            if (!stats){
                continue
            }
            if (stats.uberLengths.length != 0){
                stats.avgUberLength = stats.uberLengths.reduce((a,b) => a+b)/stats.uberLengths.length
            }
        }
    }

    toJSON(): {[id:string]: IPlayerStats} {
        return this.players
    }

}

export default PlayerStatsModule