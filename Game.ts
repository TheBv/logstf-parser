import * as events from './events'
import PlayerStatsModule from './modules/PlayerStatsModule'
import GameStateModule from './modules/GameStateModule'
import TeamStatsModule from './modules/TeamStatsModule'
import PvPModule from './modules/PvPModule'
import PvCModule from './modules/PvCModule'
import ChatModule from './modules/ChatModule'
import RealDamageModule from './modules/RealDamageModule'
import PlayerClassStatsModule from './modules/PlayerClassStatsModule'
import HealSpreadModule from './modules/HealSpreadModule'
import KillstreakModule from './modules/KillstreakModule'

// TODO: MedicStats
// TODO: HighlightsModule
// TODO: CP/CTF support
// TODO: Class support without plugin
// TODO: Feign death
// TODO: Captures

const PLAYER_EXPRESSION: RegExp = /'^(?<name>.{1,80}?)<\\d{1,4}><(?<steamid>.{1,40})><(?<team>(Red|Blue|Spectator|Console))>'/
const TIMESTAMP_EXPRESSION: RegExp = /^L (\1\d{2})\/(\2\d{2})\/(\3\d{4}) - (\4\d{2}):(\5\d{2}):(\6\d{2})/
const PROPERTIES_EXPRESSION: RegExp = /\((\w{1,60}) "([^"]{1,60})"\)/g

export interface PlayerInfo {
    id: string,
    name: string,
    team: string
}


function getFromPlayerString(playerString: string): PlayerInfo | null {
    if (!playerString) throw new Error("Empty playerString")
    const matches: any = playerString.match(PLAYER_EXPRESSION)
    if (!matches) return null

    return {
        id: matches.steamid,
        name: matches.name,
        team: matches.team
    }
}


interface IEventDefinition {
    createEvent: IEventCreator | null;
    regexp: RegExp;
}


interface IEventCreator {
    (regexpMatches: any, props: Map<string, string>, time: number): events.IEvent | null;
}


interface IEventCallback {
    (event: events.IEvent): void
}


export interface IGameState {
    isLive: boolean
    mapName: string | null
}


export class Game {
    events: Map<string, IEventDefinition>
    modules: events.IStats[]
    gameState: IGameState

    constructor() {
        this.gameState = {
            isLive: false,
            mapName: null
        }

        this.modules = [
            /*new GameStateModule(this.gameState),
            new TeamStatsModule(this.gameState),
            new PlayerStatsModule(this.gameState),
            new PlayerClassStatsModule(this.gameState),
            new PvPModule(this.gameState),
            new PvCModule(this.gameState),
            new RealDamageModule(this.gameState),
            new ChatModule(this.gameState),
            new HealSpreadModule(this.gameState),
            new KillstreakModule(this.gameState)*/
        ]

        this.events = new Map<string, IEventDefinition>()
        this.events.set("onDamage", {
            regexp: /"(?<attacker>.+?)" triggered "damage" against "(?<victim>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IDamageEvent | null {
                const attacker = getFromPlayerString(regexpMatches.groups?.attacker)
                const victim = getFromPlayerString(regexpMatches.groups?.victim)
                const damage = parseInt(props.get('damage') || '0')
                const weapon = props.get('weapon')
                const headshot = parseInt(props.get('headshot') || '0') ? true : false
                const airshot = props.get("airshot") === '1' ? true : false;
                if (!attacker) return null
                return {
                    timestamp: time,
                    attacker: attacker,
                    victim: victim,
                    damage: damage,
                    weapon: weapon,
                    headshot: headshot,
                    airshot: airshot
                }
            }
        });

        this.events.set("onHeal", {
            regexp: /"(?<player>.+?)" triggered "healed" against "(?<target>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IHealEvent | null {
                const healer = getFromPlayerString(regexpMatches.groups?.player)
                const target = getFromPlayerString(regexpMatches.groups?.target)
                const healing = parseInt(props.get('healing') || '0')

                if (!healer || !target || healing < 1 || healing > 450) return null

                return {
                    timestamp: time,
                    healer,
                    target,
                    healing
                }
            }
        });

        // L 08/26/2018 - 23:06:46: "arekk<78><[U:1:93699014]><Red>" triggered "shot_fired" (weapon "gloves")
        this.events.set("onShot", {
            regexp: /"(?<player>.+?)" triggered "shot_fired"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IShotEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                const weapon = props.get('weapon')
                if (!player ||!weapon) return null
                return {
                    timestamp: time,
                    player: player,
                    weapon: weapon,
                }

            }
        });

        this.events.set("onShotHit", {
            regexp: /"(?<player>.+?)" triggered "shot_hit"'/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IShotEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                const weapon = props.get('weapon')
                if (!player ||!weapon) return null
                return {
                    timestamp: time,
                    player: player,
                    weapon: weapon,
                }

            }
        });

        this.events.set("onKill", {
            regexp: /"(?<attacker>.+?)" killed "(?<victim>.+?)" with "(?<weapon>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IKillEvent | null {
                const attacker = getFromPlayerString(regexpMatches.groups?.attacker)
                const victim = getFromPlayerString(regexpMatches.groups?.victim)
                const weapon = regexpMatches.groups?.weapon
                const isHeadshot = props.get("headshot") === '1' ? true : false
                const isBackstab = props.get("ubercharge") === '1' ? true : false
                const isAirshot = props.get("airshot") === '1' ? true : false;
                if (!attacker || !victim) return null

                return {
                    timestamp: time,
                    headshot: isHeadshot,
                    backstab: isBackstab,
                    airshot: isAirshot,
                    attacker,
                    victim,
                    weapon,
                }
            }
        });

        this.events.set("onAssist", {
            regexp: /"(?<player>.+?)" triggered "kill assist" against "(?<victim>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IAssistEvent | null {
                const assister = getFromPlayerString(regexpMatches.groups?.player)
                const victim = getFromPlayerString(regexpMatches.groups?.victim)

                if (!assister || !victim) return null

                const attackerPosition = props.get("attacker_position") || null
                const assisterPosition = props.get("assister_position") || null
                const victimPosition = props.get("victim_position") || null

                return {
                    timestamp: time,
                    assister,
                    victim,
                    attackerPosition,
                    assisterPosition,
                    victimPosition
                }
            }
        });

        this.events.set("onPickup", {
            regexp: /"(?<player>.+?)" picked up item "(?<item>.{1,40}?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IPickupEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                if (!player) return null
                const item = regexpMatches.groups?.item
                const healingProp = props.get("healing")
                let healing = null
                if (healingProp) healing = parseInt(healingProp)
                return {
                    timestamp: time,
                    player,
                    item,
                    healing
                }
            }
        });

        this.events.set("onSuicide", {
            regexp: /"(?<player>.+?)" committed suicide'/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.ISuicideEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                if (!player) return null
                return {
                    timestamp: time,
                    player
                }
            }
        });

        this.events.set("onSpawn", {
            regexp: /"(?<player>.+?)" spawned as "(?<role>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.ISpawnEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                let role = regexpMatches.groups?.role.toLowerCase()
                if (role === 'heavy') role = 'heavyweapons'
                if (!player) return null
                return {
                    timestamp: time,
                    player,
                    role
                }
            }
        });
        this.events.set("onRole", {
            regexp: /"(?<player>.+?)" changed role to "(?<role>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoleEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                let role = regexpMatches.groups?.role.toLowerCase()
                if (role === 'heavy') role = 'heavyweapons'
                if (!player) return null
                return {
                    timestamp: time,
                    player,
                    role
                }
            }
        });

        // (cp "0") (cpname "Blue Final Point") (numcappers "4") (player1 "yomps<76><[U:1:84024852]><Red>") (position1 "-3530 -1220 583") (player2 "b4nny<77><[U:1:10403381]><Red>") (position2 "-3570 -1311 583") (player3 "arekk<78><[U:1:93699014]><Red>") (position3 "-3509 -1157 576") (player4 "cookiejake<81><[U:1:84193779]><Red>") (position4 "-3521 -1306 583")
        this.events.set("onCapture", {
            regexp: /Team "(?<team>(Red|Blue)?)" triggered "pointcaptured'/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.ICaptureEvent | null {
                const pointId = parseInt(props.get('cp') || '-1') + 1
                const pointName = props.get('cpname') || '';
                const input = regexpMatches.groups?.input + " "; //This is needed to avoid inconsistencies
                const CAPTURE_PLAYERS = /\(player\d{1,2} "(?<name>.{0,80}?)<\d{1,4}><(?<steamid>.{1,40})><(?<team2>(Red|Blue|Spectator|Console))>"\) \(position\d{1,2} ".{1,30}"\) /g;
                const matches = [...input.matchAll(CAPTURE_PLAYERS)];
                const players:PlayerInfo[] = [];
                if (parseInt(props.get('numcappers') || '0') !== matches.length) {
                    return null;   
                }
                for (const match of matches) {
                    const player = getFromPlayerString(match[0])
                    if (player)
                        players.push(player);
                }
                return {
                    timestamp: time,
                    team: regexpMatches.groups?.team,
                    numCappers: parseInt(props.get('numcappers')|| '0'),
                    pointId,
                    pointName,
                    players,
                }
            }
        });
        this.events.set("onMedicDeath", {
            regexp: /"(?<attacker>.+?)" triggered "medic_death" against "(?<victim>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IMedicDeathEvent | null {
                const attacker = getFromPlayerString(regexpMatches.groups?.attacker)
                const victim = getFromPlayerString(regexpMatches.groups?.victim)
                if (!attacker || !victim) return null
                const isDrop = props.get("ubercharge") === '1' ? true : false
                return {
                    timestamp: time,
                    attacker,
                    victim,
                    isDrop,
                }
            }
        });

        this.events.set("onRoundStart", {
            regexp: /World triggered "Round_Start"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundStartEvent | null {
                return {
                    timestamp: time
                }
            }
        });

        this.events.set("onRoundEnd", {
            regexp: /World triggered "Round_(?<type>Win|Stalemate)/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundEndEvent | null {
                const winner = props.get('winner') || null
                return {
                    timestamp: time,
                    type: regexpMatches.groups?.type,
                    winner: <events.Team>winner
                }
            }
        });

        this.events.set("onGameOver", {
            regexp: /World triggered "Game_Over" reason "(?<reason>.+)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IGameOverEvent | null {
                return {
                    timestamp: time,
                    reason: regexpMatches.groups?.reason 
                }
            }
            
        });

        this.events.set("onJoinTeam", {
            regexp: /"(?<player>.+?)" joined team "(?<newteam>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IJoinTeamEvent | null {
                const reason = props.get("reason") || ""
                const player = getFromPlayerString(regexpMatches.groups?.player)
                if (!player) return null
                return {
                    timestamp: time,
                    newTeam: regexpMatches.groups?.newteam,
                    player: player
                }
            }
        });

        this.events.set("onDisconnect", {
            regexp: /"(?<player>.+?)" disconnected/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IDisconnectEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                const reason = props.get("reason") || ""   
                if (!player) return null   
                return {
                    timestamp: time,
                    player: player,
                    reason: reason
                }
            }
            
        });

        this.events.set("onCharge", {
            regexp: /"(?<player>.+?)" triggered "chargedeployed"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IChargeEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                if (!player) return null
                const medigunType = props.get("medigun") || "medigun"
                return {
                    player: player,
                    timestamp: time,
                    medigunType: medigunType
                }
            }
        });

        this.events.set("onChat", {
            regexp: /"(?<player>.+?)" say "(?<message>.{1,160}?)"/,
            createEvent: function (regexpMatches: RegExpExecArray, props: Map<string, string>, time: number): events.IChatEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player!)
                
                if (!player) return null
                const message = regexpMatches.groups?.message!

                return {
                    timestamp: time,
                    player,
                    message,
                }
            }
        });

        this.events.set("onBuild", {
            regexp: /"(?<player>.+?)" triggered "player_builtobject"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IBuildEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                if(!player) return null
                const position = props.get("position") || null
                const object = props.get("object")
                return {
                    player: player,
                    timestamp: time,
                    builtObject: <events.Building>object,
                    position: position
                }
            }
            
        });

        this.events.set("onObjectDestroyed", {
            regexp: /"(?<player>.+?)" triggered "killedobject"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IObjectDestroyedEvent | null {
                const attacker = getFromPlayerString(regexpMatches.groups?.player)
                const objectOwnerProps = props.get("objectowner")
                if(!attacker|| !objectOwnerProps) return null
                const objectOwner = getFromPlayerString(objectOwnerProps);
                if (!objectOwner) return null
                return {
                    attacker: attacker,
                    builtObject: <events.Building>props.get("object"),
                    objectOwner: objectOwner,
                    weapon: props.get("weapon"),
                    attackerPosition: props.get("attacker_position")||null,
                    assist: props.get("assist")? true : false,
                    assistPositon: props.get("assister_position")|| null,
                    timestamp: time,
                }
            }
            
        });

        this.events.set("onFlag", {
            regexp: /"(?<player>.+?)" triggered "flagevent"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IFlagEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                if(!player) return null
                const position = props.get("position") || null
                return {
                    player: player,
                    timestamp: time,
                    type: <events.FlagEvent>props.get("event"),
                    position: position
                }
            }
            
        });

        this.events.set("onScore", {
            regexp: /Team "(?<team>(Red|Blue))" (current|final) score "(?<score>\\d+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundScoreEvent | null {
                return {
                    timestamp: time,
                    team: regexpMatches.groups?.team,
                    score: regexpMatches.groups?.score,
                }
            }
        });

        this.events.set("onPause", {
            regexp: /World triggered "Game_Paused"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IPauseEvent | null {
                return {
                    timestamp: time,
                }
            }
        });

        this.events.set("onUnpause", {
            regexp: /World triggered "Game_Unpaused'/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IUnpauseEvent | null {
                return {
                    timestamp: time,
                }
            }
        });

        this.events.set("onMapLoad", {
            regexp: /Started map "(?<mapname>.+?)/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IMapLoadEvent | null {
                return {
                    timestamp: time,
                    mapName: regexpMatches.groups?.mapname
                }
            }
        });

        this.events.set("onFirstHeal", {
            regexp: /"(?<player>.+?)" triggered "first_heal_after_spawn"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IFirstHealEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                const timeTaken = props.get('time')
                if (!player ||!timeTaken) return null
                return {
                    timestamp: time,
                    player: player,
                    time : parseFloat(timeTaken)
                }

            }
        });

        this.events.set("onChargeReady", {
            regexp: /"(?<player>.+?)" triggered "chargeready"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IChargeReadyEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                if (!player) return null
                return {
                    timestamp: time,
                    player: player,
                }

            }
        });

        this.events.set("onChargeEnded", {
            regexp: /"(?<player>.+?)" triggered "chargeended"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IChargeEndedEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                const duration = props.get('duration')
                if (!player ||!duration) return null
                return {
                    timestamp: time,
                    player: player,
                    duration: parseFloat(duration),
                }

            }
        });

        this.events.set("onMedicDeathEx", {
            regexp: /"(?<player>.+?)" triggered "medic_death_ex"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IMedicDeathExEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                const uberpct = props.get('uberpct')
                if (!player ||!uberpct) return null
                return {
                    timestamp: time,
                    player: player,
                    uberpct: parseInt(uberpct),
                }

            }
        });

        this.events.set("onEmptyUber", {
            regexp: /"(?<player>.+?)" triggered "empty_uber"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IEmptyUberEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                if (!player) return null
                return {
                    timestamp: time,
                    player: player,
                }
            }
        });
        
        this.events.set("onLostUberAdv", {
            regexp: /"(?<player>.+?)" triggered "lost_uber_advantage"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.ILostUberAdvantageEvent | null {
                const player = getFromPlayerString(regexpMatches.groups?.player)
                const timeLost = props.get('time')
                if (!player ||!timeLost) return null
                return {
                    timestamp: time,
                    player: player,
                    time: parseFloat(timeLost),
                }

            }
        });
    }

    createEvent(eventType: string, regexpMatches: object, props: Map<string, string>, time: number): events.IEvent | null {
        const eventDefinition = this.events.get(eventType)
        if (!eventDefinition || !eventDefinition.createEvent) return null
        const event = eventDefinition.createEvent(regexpMatches, props, time)
        return event
    }

    processLine(line: string) {
        const eventLine = line.slice(25)
        for (let [eventName, eventProps] of this.events.entries()) {
            const matches = eventLine.match(eventProps.regexp);
            if (!matches) continue
            const time = this.makeTimestamp(line)
            if (!time) return
            const props = new Map<string, string>()

            for (const [key, value] of eventLine.matchAll(PROPERTIES_EXPRESSION)){
                props.set(key, value)
            }

            const event: events.IEvent | null = this.createEvent(eventName, matches, props, time);
            if (!event) return

            for (const m of this.modules) {
                const callback: IEventCallback = m[eventName]
                if (callback) callback.call(m, event)
            }
        }
    }


    private makeTimestamp(line: string): number | null {
        const t = TIMESTAMP_EXPRESSION.exec(line);
        if (!t) return null
        const year = parseInt(t[3])
        const month = parseInt(t[1]) - 1
        const day = parseInt(t[2])
        const hours = parseInt(t[4])
        const minutes = parseInt(t[5])
        const seconds = parseInt(t[6])
        const time = new Date(year, month, day, hours, minutes, seconds).getTime() / 1000;
        return time
    }

    finish(): void {
        for (const m of this.modules) {
            if (m.finish) m.finish()
        }
    }

    toJSON() {
        let output: any = {}
        for (const m of this.modules) {
            if (m.toJSON) output[m.identifier] = m.toJSON()
        }
        return output
    }
}
