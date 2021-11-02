import * as events from '../interfaces/events'
import { IGameState, PlayerInfo } from '../Game'
import { renameObjectKeys } from "../Utilities"
import { ClassStat, Medicstats, Player, Players, WeaponStats } from "../interfaces/LogstfInterfaces"
import PlayerClassStatsModule from "./PlayerClassStatsModule"
import RealDamageModule from "./RealDamageModule"


interface IMedicStats {
    advantagesLost: number
    biggestAdvantageLost: number
    nearFullChargeDeaths: number
    deathsAfterUber: number
    avgTimeBeforeFirstHealing: number //This refers to the time the medic takes to first heal someone after he spawns
    avgTimeToBuild: number
    avgTimeToUse: number
    avgUberLength: number
}

interface IInternalStats {
    timesBeforeHealing: number[]
    timesToBuild: number[]
    uberLengths: number[]
    timesBeforeUsing: number[]
    lastUsedTime: number
    lastEmptyUberTime: number
    lastChargeObtainedTime: number
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
    chargesByType: { [index: string]: number }
    drops: number
    airshots: number
    sentriesBuilt: number
    sentriesDestroyed: number
    headshots: number
    headshotKills: number
    healing: number
    healingReceived: number
    medkits: number
    medkitsHp: number
    backstabs: number
    capturesPoint: number
    capturesIntel: number
    longestKillStreak: number
    currentKillStreak: number
    medicstats: IMedicStats | null
}

class PlayerStatsModule implements events.IStats {
    public identifier: string
    private players: { [id: string]: IPlayerStats }
    private internalStats: { [id: string]: IInternalStats }
    private gameState: IGameState

    constructor(gameState: IGameState) {
        this.identifier = 'players'
        this.players = {}
        this.internalStats = {}
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
        medkitsHp: 0,
        backstabs: 0,
        capturesPoint: 0,
        capturesIntel: 0,
        longestKillStreak: 0,
        currentKillStreak: 0,
        medicstats: null,
    })

    private defaultInternalStats = (): IInternalStats => ({
        timesBeforeHealing: [],
        timesToBuild: [],
        uberLengths: [],
        timesBeforeUsing: [],
        lastUsedTime: 0,
        lastEmptyUberTime: 0,
        lastChargeObtainedTime: 0,
    })

    private defaultMedicStats = (): IMedicStats => ({
        advantagesLost: 0,
        biggestAdvantageLost: 0,
        nearFullChargeDeaths: 0,
        deathsAfterUber: 0,
        avgTimeBeforeFirstHealing: 0,
        avgTimeToBuild: 0,
        avgTimeToUse: 0,
        avgUberLength: 0
    })

    private getMean(input: number[]): number {
        if (input.length != 0)
            return input.reduce((a, b) => a + b) / input.length
        return 0
    }

    private getOrCreatePlayer(player: PlayerInfo): IPlayerStats {
        if (!(player.id in this.players)) {
            this.players[player.id] = this.defaultPlayer()
        }
        let playerInstance = this.players[player.id]
        if (!playerInstance) throw new Error()
        playerInstance.team = player.team
        return playerInstance
    }

    private getOrCreateStats(player: PlayerInfo): IInternalStats {
        if (!(player.id in this.internalStats)) {
            this.internalStats[player.id] = this.defaultInternalStats()
        }
        let playerInstance = this.internalStats[player.id]
        if (!playerInstance) throw new Error()
        return playerInstance
    }

    onKill(event: events.IKillEvent) {
        if (!this.gameState.isLive) return
        if (event.feignDeath) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)
        const victim: IPlayerStats = this.getOrCreatePlayer(event.victim)

        attacker.kills++
        attacker.currentKillStreak++

        if (event.headshot) attacker.headshotKills++
        if (event.backstab) attacker.backstabs++
        
        victim.deaths++
        victim.longestKillStreak = Math.max(victim.currentKillStreak, victim.longestKillStreak)
        attacker.longestKillStreak = Math.max(attacker.currentKillStreak, attacker.longestKillStreak);
        victim.currentKillStreak = 0
    }

    onDamage(event: events.IDamageEvent) {
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)
        attacker.damage += event.damage
        if (event.headshot) attacker.headshots += 1
        if (event.airshot) attacker.airshots += 1
        if (event.healing) attacker.healing += event.healing

        if (event.victim) {
            const victim: IPlayerStats = this.getOrCreatePlayer(event.victim)
            const stats: IInternalStats = this.getOrCreateStats(event.victim)
            if (victim) {
                victim.damageTaken += event.damage
            }
        }
    }

    onCapture(event: events.ICaptureEvent) {
        if (!this.gameState.isLive) return
        for (const playerInfo of event.players) {
            const player: IPlayerStats = this.getOrCreatePlayer(playerInfo)
            player.capturesPoint += 1
        }
    }

    onFlag(event: events.IFlagEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        if (event.type == events.FlagEvent.Captured) {
            player.capturesIntel += 1
        }
    }

    onPickup(event: events.IPickupEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        if (event.healing != null) {
            player.medkitsHp += event.healing
            switch (event.item) {
                case ("medkit_medium"):
                    player.medkits += 2
                    break
                case ("medkit_large"):
                    player.medkits += 4
                    break
                default:
                    player.medkits += 1
                    break
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

    onFirstHeal(event: events.IFirstHealEvent) {
        if (!this.gameState.isLive) return
        const statsHealer: IInternalStats = this.getOrCreateStats(event.player)
        statsHealer.timesBeforeHealing.push(event.time)
    }

    onBuild(event: events.IBuildEvent) {
        if (!this.gameState.isLive) return
        if (event.builtObject == events.Building.Sentry) {
            const player: IPlayerStats = this.getOrCreatePlayer(event.player)
            player.sentriesBuilt += 1
        }
    }

    onObjectDestroyed(event: events.IObjectDestroyedEvent) {
        if (!this.gameState.isLive) return
        if (event.builtObject == events.Building.Sentry) {
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
        const stats: IInternalStats = this.getOrCreateStats(event.player)
        player.charges += 1
        if (!(event.medigunType in player.chargesByType)) {
            player.chargesByType[event.medigunType] = 0
        }
        player.chargesByType[event.medigunType] += 1
        stats.lastUsedTime = event.timestamp
        stats.timesBeforeUsing.push(event.timestamp - stats.lastChargeObtainedTime)
    }

    onChargeReady(event: events.IChargeReadyEvent) {
        if (!this.gameState.isLive) return
        const stats: IInternalStats = this.getOrCreateStats(event.player)
        stats.lastChargeObtainedTime = event.timestamp
        stats.timesToBuild.push(event.timestamp - stats.lastEmptyUberTime)
    }

    onLostUberAdv(event: events.ILostUberAdvantageEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        if (!player.medicstats) {
            player.medicstats = this.defaultMedicStats()
        }
        player.medicstats.advantagesLost += 1
        player.medicstats.biggestAdvantageLost = Math.max(player.medicstats.biggestAdvantageLost, event.time)
    }

    onMedicDeath(event: events.IMedicDeathEvent) {
        if (!this.gameState.isLive) return
        const attacker: IPlayerStats = this.getOrCreatePlayer(event.attacker)
        const victim: IPlayerStats = this.getOrCreatePlayer(event.victim)
        const stats: IInternalStats = this.getOrCreateStats(event.victim)
        if (event.isDrop)
            victim.drops += 1
        if (event.timestamp - stats.lastUsedTime <= 20) {
            if (!victim.medicstats) {
                victim.medicstats = this.defaultMedicStats()
            }
            victim.medicstats.deathsAfterUber += 1
        }

    }

    onMedicDeathEx(event: events.IMedicDeathExEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        if (!player.medicstats) {
            player.medicstats = this.defaultMedicStats()
        }
        if (event.uberpct >= 95 && event.uberpct < 100) {
            player.medicstats.nearFullChargeDeaths += 1
        }
    }

    onChargeEnded(event: events.IChargeEndedEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        const stats: IInternalStats = this.getOrCreateStats(event.player)
        if (!player.medicstats) {
            player.medicstats = this.defaultMedicStats()
        }
        stats.uberLengths.push(event.duration)
    }

    onEmptyUber(event: events.IEmptyUberEvent) {
        if (!this.gameState.isLive) return
        const player: IPlayerStats = this.getOrCreatePlayer(event.player)
        const stats: IInternalStats = this.getOrCreateStats(event.player)
        if (!player.medicstats) {
            player.medicstats = this.defaultMedicStats()
        }
        stats.lastEmptyUberTime = event.timestamp
    }

    finish(): void {
        const self = this
        for (const key of Object.keys({ ...this.players, ...this.internalStats })) {
            const player = self.players[key]
            const stats = self.internalStats[key]
            if (!stats || !player) continue
            if (player.medicstats && stats) {
                player.medicstats.avgUberLength = self.getMean(stats.uberLengths)
                player.medicstats.avgTimeToBuild = self.getMean(stats.timesToBuild)
                player.medicstats.avgTimeToUse = self.getMean(stats.timesBeforeUsing)
                player.medicstats.avgTimeBeforeFirstHealing = self.getMean(stats.timesBeforeHealing)
            }
        }
    }

    toJSON(): { [id: string]: IPlayerStats } {
        return this.players
    }
    // Function to transform all of the data to the json format used on logs.tf if a module is missing the stat will be omitted
    toLogstf(realDamage: RealDamageModule | null, playerClasses: PlayerClassStatsModule | null, totalLength: number | null): Players {
        const players: Players = {}
        for (const playerKey of Object.keys(this.players)) {
            const playerValue = this.players[playerKey]
            players[playerKey] = <Player>renameObjectKeys(playerValue, new Map<string, any>([
                ["airshots", "as"],
                ["assists", "assists"],
                ["backstabs", "backstabs"],
                //CLASS STATS
                ["capturesPoint", "cpc"],
                //dapd, dapm
                ["deaths", "deaths"],
                ["damage", "dmg"],
                //dmg_real, dt_real
                ["drops", "drops"],
                ["damageTaken", "dt"],
                ["headshots", "headshots_hit"],
                ["headshotKills", "headshots"],
                ["healing", "heal"],
                ["healingReceived", "hr"],
                ["capturesIntel", "ic"],
                //KAPD
                ["kills", "kills"],
                ["longestKillStreak", "lks"],
                //MEDICSTATS
                ["medkits", "medkits"],
                ["medkitsHp", "medkits_hp"],
                ["sentriesBuilt", "sentries"],
                ["suicides", "suicides"],
                ["team", "team"],
                ["charges", "ubers"],
                ["chargesByType", "ubertypes"]
            ]))
            //CLASSSTATS
            if (playerClasses) {
                players[playerKey].class_stats = []
                for (const [classKey, classValue] of (playerClasses.toJSON().get(playerKey) || [])) {
                    if (classValue.damage + classValue.kills + classValue.assists + classValue.deaths == 0 && classValue.playtimeInSeconds <= 20)
                        continue;
                    const classStat: ClassStat = <ClassStat>renameObjectKeys(classValue, new Map<string, any>([
                        ["assists", "assists"],
                        ["deaths", "deaths"],
                        ["damage", "dmg"],
                        ["kills", "kills"],
                        ["playtimeInSeconds", "total_time"],
                    ]))
                    if (classStat.dmg + classStat.kills + classStat.assists + classStat.deaths == 0)
                        continue;
                    classStat.weapon = {}
                    //WEAPONSTATS
                    for (const [weaponKey, weaponValue] of classValue.weapons) {
                        classStat.weapon[weaponKey] = <WeaponStats>renameObjectKeys(weaponValue, new Map<string, any>([
                            ["avgDamage", "avg_dmg"],
                            ["damage", "dmg"],
                            ["hits", "hits"],
                            ["kills", "kills"],
                            ["shots", "shots"],
                        ]))
                    }
                    classStat.type = classKey
                    players[playerKey].class_stats?.push(classStat)
                }
                //Sort by playtime
                players[playerKey].class_stats?.sort((a, b) => b.total_time - a.total_time)
            }
            players[playerKey].dapd = Math.floor(playerValue.damage / playerValue.deaths)
            if (totalLength)
                players[playerKey].dapm = Math.floor(playerValue.damage * 60 / totalLength)
            players[playerKey].kapd = ((playerValue.kills + playerValue.assists) / playerValue.deaths).toFixed(1)
            players[playerKey].kpd = (playerValue.kills / playerValue.deaths).toFixed(1)
            if (realDamage) {
                players[playerKey].dmg_real = realDamage.toJSON()[playerKey].damageDealt
                players[playerKey].dt_real = realDamage.toJSON()[playerKey].damageTaken
            }
            //MEDICSTATS
            if (playerValue.medicstats)
                players[playerKey].medicstats = <Medicstats>renameObjectKeys(playerValue.medicstats, new Map<string, any>([
                    ["advantagesLost", "advantages_lost"],
                    ["avgTimeBeforeFirstHealing", "avg_time_before_healing"],
                    ["avgTimeToUse", "avg_time_before_using"],
                    ["avgTimeToBuild", "avg_time_to_build"],
                    ["avgUberLength", "avg_uber_length"],
                    ["biggestAdvantageLost", "biggest_advantage_lost"],
                    ["deathsAfterUber", "deaths_within_20s_after_uber"],
                    ["nearFullChargeDeaths", "deaths_with_95_99_uber"]
                ]))
        }
        return players
    }

}

export default PlayerStatsModule