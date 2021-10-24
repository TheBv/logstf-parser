import * as events from './events'
import SteamID from 'steamid'
// TODO: HighlightsModule
// TODO: Class support without plugin
// TODO: Feign death

const PLAYER_EXPRESSION: RegExp = /^(?<name>.{1,80}?)<\d{1,4}><(?<steamid>(?!STEAM_\d).{1,40})><(?<team>(Red|Blue|Spectator|Console))>/
const TIMESTAMP_EXPRESSION: RegExp = /^L (\1\d{2})\/(\2\d{2})\/(\3\d{4}) - (\4\d{2}):(\5\d{2}):(\6\d{2})/
const PROPERTIES_EXPRESSION: RegExp = /\((\w{1,60}) "([^"]{1,60})"\)/g

export interface PlayerInfo {
    id: string,
    name: string,
    team: string
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

interface ITimeState {
    difference: number
    previousTime: number
}

export interface IGameState {
    isLive: boolean
    mapName: string | null
}


export class Game {
    playerTriggeredMain: [string, IEventDefinition]
    playerTriggeredEvents: Map<string, IEventDefinition>
    worldMain: [string, IEventDefinition]
    worldEvents: Map<string, IEventDefinition>
    events: Map<string, IEventDefinition>
    modules: events.IStats[]
    gameState: IGameState
    timeState: ITimeState
    useSteam64: boolean
    constructor(useSteam64: boolean) {
        this.gameState = {
            isLive: false,
            mapName: null
        }
        this.useSteam64 = useSteam64;
        this.modules = []
        this.playerTriggeredEvents = new Map<string, IEventDefinition>()
        this.worldEvents = new Map<string, IEventDefinition>()
        this.events = new Map<string, IEventDefinition>()
        this.timeState = { difference: 0, previousTime: -1 }
        const self = this;

        //PLAYER TRIGGERED EVENTS

        // Used to mainly check for pause/unpause desyncing
        this.playerTriggeredMain = ["onTriggered", {
            regexp: /^"(?<player>.+?)" triggered/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.ITriggeredEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null
                return {
                    timestamp: time,
                    player: player,
                }
            }
        }];

        this.playerTriggeredEvents.set("onDamage", {
            regexp: /^"(?<attacker>.+?)" triggered "damage"( against "(?<victim>.+?)")?/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IDamageEvent | null {
                const attacker = self.getFromPlayerString(regexpMatches.attacker)
                if (!attacker) return null
                let victim = null
                if (regexpMatches.victim)
                    victim = self.getFromPlayerString(regexpMatches.victim)
                let damage = parseInt(props.get('damage') || '0')
                if (damage < 0) damage = 0
                // Fully buffed heavy hp = 450 knife deals 6-times that + some leeway
                if (damage > 500 * 6) damage = 500 * 6
                const weapon = props.get('weapon')
                const headshot = parseInt(props.get('headshot') || '0') ? true : false
                const airshot = props.get("airshot") === '1' ? true : false;


                return {
                    timestamp: time,
                    attacker,
                    victim,
                    damage,
                    weapon,
                    headshot,
                    airshot
                }
            }
        });

        this.playerTriggeredEvents.set("onHeal", {
            regexp: /^"(?<player>.+?)" triggered "healed" against "(?<target>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IHealEvent | null {
                const healer = self.getFromPlayerString(regexpMatches.player)
                const target = self.getFromPlayerString(regexpMatches.target)
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
        this.playerTriggeredEvents.set("onShot", {
            regexp: /^"(?<player>.+?)" triggered "shot_fired"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IShotEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                const weapon = props.get('weapon')
                if (!player || !weapon) return null

                return {
                    timestamp: time,
                    player,
                    weapon,
                }

            }
        });

        this.playerTriggeredEvents.set("onShotHit", {
            regexp: /^"(?<player>.+?)" triggered "shot_hit"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IShotEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                const weapon = props.get('weapon')
                if (!player || !weapon) return null

                return {
                    timestamp: time,
                    player,
                    weapon,
                }

            }
        });

        this.playerTriggeredEvents.set("onAssist", {
            regexp: /^"(?<player>.+?)" triggered "kill assist" against "(?<victim>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IAssistEvent | null {
                const assister = self.getFromPlayerString(regexpMatches.player)
                let victim = null
                if (regexpMatches.victim)
                    victim = self.getFromPlayerString(regexpMatches.victim)

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

        this.playerTriggeredEvents.set("onMedicDeath", {
            regexp: /^"(?<attacker>.+?)" triggered "medic_death" against "(?<victim>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IMedicDeathEvent | null {
                const attacker = self.getFromPlayerString(regexpMatches.attacker)
                const victim = self.getFromPlayerString(regexpMatches.victim)
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

        this.playerTriggeredEvents.set("onBuild", {
            regexp: /^"(?<player>.+?)" triggered "player_builtobject"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IBuildEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null
                const position = props.get("position") || null
                const object = props.get("object")
                return {
                    timestamp: time,
                    builtObject: <events.Building>object,
                    player,
                    position
                }
            }
        });

        this.playerTriggeredEvents.set("onObjectDestroyed", {
            regexp: /^"(?<player>.+?)" triggered "killedobject"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IObjectDestroyedEvent | null {
                const attacker = self.getFromPlayerString(regexpMatches.player)
                const objectOwnerProps = props.get("objectowner")
                if (!attacker || !objectOwnerProps) return null
                const objectOwner = self.getFromPlayerString(objectOwnerProps);
                if (!objectOwner) return null

                return {
                    builtObject: <events.Building>props.get("object"),
                    weapon: props.get("weapon"),
                    attackerPosition: props.get("attacker_position") || null,
                    assist: props.get("assist") ? true : false,
                    assistPositon: props.get("assister_position") || null,
                    timestamp: time,
                    objectOwner,
                    attacker,
                }
            }
        });

        this.playerTriggeredEvents.set("onFlag", {
            regexp: /^"(?<player>.+?)" triggered "flagevent"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IFlagEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null
                const position = props.get("position") || null
                return {
                    timestamp: time,
                    type: <events.FlagEvent>props.get("event"),
                    player,
                    position
                }
            }

        });

        this.playerTriggeredEvents.set("onFirstHeal", {
            regexp: /^"(?<player>.+?)" triggered "first_heal_after_spawn"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IFirstHealEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                const timeTaken = props.get('time')
                if (!player || !timeTaken) return null
                return {
                    timestamp: time,
                    time: parseFloat(timeTaken),
                    player,
                }

            }
        });

        this.playerTriggeredEvents.set("onChargeReady", {
            regexp: /^"(?<player>.+?)" triggered "chargeready"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IChargeReadyEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null
                return {
                    timestamp: time,
                    player,
                }

            }
        });

        this.playerTriggeredEvents.set("onCharge", {
            regexp: /^"(?<player>.+?)" triggered "chargedeployed"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IChargeEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null
                const medigunType = props.get("medigun") || "medigun"
                return {
                    timestamp: time,
                    player,
                    medigunType
                }
            }
        });

        this.playerTriggeredEvents.set("onChargeEnded", {
            regexp: /^"(?<player>.+?)" triggered "chargeended"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IChargeEndedEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                const duration = props.get('duration')
                if (!player || !duration) return null
                return {
                    timestamp: time,
                    duration: parseFloat(duration),
                    player,
                }

            }
        });

        this.playerTriggeredEvents.set("onMedicDeathEx", {
            regexp: /^"(?<player>.+?)" triggered "medic_death_ex"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IMedicDeathExEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                const uberpct = props.get('uberpct')
                if (!player || !uberpct) return null
                return {
                    timestamp: time,
                    uberpct: parseInt(uberpct),
                    player,
                }

            }
        });

        this.playerTriggeredEvents.set("onEmptyUber", {
            regexp: /^"(?<player>.+?)" triggered "empty_uber"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IEmptyUberEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null
                return {
                    timestamp: time,
                    player,
                }

            }
        });

        this.playerTriggeredEvents.set("onLostUberAdv", {
            regexp: /^"(?<player>.+?)" triggered "lost_uber_advantage"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.ILostUberAdvantageEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                const timeLost = props.get('time')
                if (!player || !timeLost) return null
                return {
                    timestamp: time,
                    time: parseFloat(timeLost),
                    player,
                }

            }
        });

        //WORLD EVENTS

        this.worldMain = ["onWorldTriggered", {
            regexp: /^World triggered/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IWorldTriggeredEvent | null {
                return {
                    timestamp: time
                }
            }
        }];

        this.worldEvents.set("onRoundStart", {
            regexp: /^World triggered "Round_Start"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundStartEvent | null {
                return {
                    timestamp: time
                }
            }
        });

        this.worldEvents.set("onRoundEnd", {
            regexp: /^World triggered "Round_(?<type>Win|Stalemate)/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundEndEvent | null {
                const winner = props.get('winner') || null

                return {
                    timestamp: time,
                    type: regexpMatches.type,
                    winner: <events.Team>winner
                }
            }
        });

        this.worldEvents.set("onMiniRoundStart", {
            regexp: /^World triggered "Mini_Round_Start"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundStartEvent | null {
                return {
                    timestamp: time
                }
            }
        });
        // World triggered "Mini_Round_Selected" (round "Round_A")
        this.worldEvents.set("onMiniRoundSelected", {
            regexp: /^World triggered "Mini_Round_Selected"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IMiniRoundSelected | null {
                const round = props.get("round") || ""
                return {
                    timestamp: time,
                    round: round
                }
            }
        });
        // World triggered "Mini_Round_Win" (winner "Red") (round "Round_A"); usually accomponied by Round_Win
        this.worldEvents.set("onMiniRoundWin", {
            regexp: /^World triggered "Mini_Round_Win"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IMiniRoundWin | null {
                const winner = props.get('winner') || null
                const round = props.get('round') || ""
                return {
                    timestamp: time,
                    type: "Win",
                    winner: <events.Team>winner,
                    round: round
                }
            }
        });
        // World triggered "Mini_Round_Length" (seconds "345.02")
        this.worldEvents.set("onMiniRoundLength", {
            regexp: /^World triggered "Mini_Round_Length"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundLengthEvent | null {
                const length = parseInt(props.get('numcappers') || '-1');
                return {
                    timestamp: time,
                    lengthInSeconds: length
                }
            }
        });

        this.worldEvents.set("onRoundSetupBegin", {
            regexp: /^World triggered "Round_Setup_Begin"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundSetupBegin | null {
                return {
                    timestamp: time
                }
            }
        });

        this.worldEvents.set("onRoundSetupEnd", {
            regexp: /^World triggered "Round_Setup_End"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundSetupEnd | null {
                return {
                    timestamp: time
                }
            }
        });

        this.worldEvents.set("onGameOver", {
            regexp: /^World triggered "Game_Over" reason "(?<reason>.+)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IGameOverEvent | null {
                return {
                    timestamp: time,
                    reason: regexpMatches.reason
                }
            }

        });

        this.worldEvents.set("onPause", {
            regexp: /^World triggered "Game_Paused/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IPauseEvent | null {
                return {
                    timestamp: time,
                }
            }
        });

        this.worldEvents.set("onUnpause", {
            regexp: /^World triggered "Game_Unpaused/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IUnpauseEvent | null {
                return {
                    timestamp: time,
                }
            }
        });

        //OTHER EVENTS

        this.events.set("onKill", {
            regexp: /^"(?<attacker>.+?)" killed "(?<victim>.+?)" with "(?<weapon>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IKillEvent | null {
                const attacker = self.getFromPlayerString(regexpMatches.attacker)
                let victim = null
                if (regexpMatches.victim)
                    victim = self.getFromPlayerString(regexpMatches.victim)

                if (!attacker || !victim) return null

                const weapon = regexpMatches.weapon
                let isHeadshot = props.get("headshot") === '1' ? true : false
                let isBackstab = false
                const isAirshot = props.get("airshot") === '1' ? true : false

                if (props.has("customkill")){
                    if (props.get("customkill") == "backstab")
                        isBackstab = true
                    if (props.get("customkill") == "headshot")
                        isHeadshot = true
                }

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

        this.events.set("onPickup", {
            regexp: /^"(?<player>.+?)" picked up item "(?<item>.{1,40}?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IPickupEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null
                const item = regexpMatches.item
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
            regexp: /^"(?<player>.+?)" committed suicide/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.ISuicideEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null

                return {
                    timestamp: time,
                    player
                }
            }
        });

        this.events.set("onSpawn", {
            regexp: /^"(?<player>.+?)" spawned as "(?<role>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.ISpawnEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                let role = regexpMatches.role.toLowerCase()
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
            regexp: /^"(?<player>.+?)" changed role to "(?<role>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoleEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                let role = regexpMatches.role.toLowerCase()
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
            regexp: /^Team "(?<team>(Red|Blue)?)" triggered "pointcaptured" (?<rest>.*)/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.ICaptureEvent | null {
                const pointId = parseInt(props.get('cp') || '-1') + 1
                const pointName = props.get('cpname') || '';
                const input = regexpMatches.rest + " "; //This is needed to avoid inconsistencies
                const CAPTURE_PLAYERS = /\(player\d{1,2} "(?<name>.{0,80}?)<\d{1,4}><(?<steamid>.{1,40})><(?<team2>(Red|Blue|Spectator|Console))>"\) \(position\d{1,2} ".{1,30}"\) /g;
                const matches = [...input.matchAll(CAPTURE_PLAYERS)];
                const players: PlayerInfo[] = [];

                if (parseInt(props.get('numcappers') || '0') !== matches.length) {
                    return null;
                }

                for (const match of matches) {
                    const player = self.getFromPlayerString(match[0])
                    if (player)
                        players.push(player);
                }

                return {
                    numCappers: parseInt(props.get('numcappers') || '0'),
                    timestamp: time,
                    team: regexpMatches.team,
                    pointId,
                    pointName,
                    players,
                }
            }
        });


        this.events.set("onJoinTeam", {
            regexp: /^"(?<player>.+?)" joined team "(?<newteam>.+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IJoinTeamEvent | null {
                const reason = props.get("reason") || ""
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null
                return {
                    timestamp: time,
                    newTeam: regexpMatches.newteam,
                    player
                }
            }
        });

        this.events.set("onDisconnect", {
            regexp: /^"(?<player>.+?)" disconnected/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IDisconnectEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                const reason = props.get("reason") || ""
                if (!player) return null

                return {
                    timestamp: time,
                    player,
                    reason
                }
            }

        });

        this.events.set("onChat", {
            regexp: /^"(?<player>.+?)" say "(?<message>.{1,160}?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IChatEvent | null {
                const player = self.getFromPlayerString(regexpMatches.player)
                if (!player) return null
                const message = regexpMatches.message
                return {
                    timestamp: time,
                    message,
                    player,
                }
            }
        });

        this.events.set("onScore", {
            regexp: /^Team "(?<team>(Red|Blue))" (current|final) score "(?<score>\d+?)"/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IRoundScoreEvent | null {
                return {
                    timestamp: time,
                    team: regexpMatches.team,
                    score: parseInt(regexpMatches.score),
                }
            }
        });

        this.events.set("onMapLoad", {
            regexp: /Started map "(?<mapname>.+?)'/,
            createEvent: function (regexpMatches: any, props: Map<string, string>, time: number): events.IMapLoadEvent | null {
                return {
                    timestamp: time,
                    mapName: regexpMatches.mapname
                }
            }
        });

    }

    getFromPlayerString(playerString: string): PlayerInfo | null {
        if (!playerString) throw new Error("Empty playerString")
        const matches: any = playerString.match(PLAYER_EXPRESSION)
        if (!matches) return null
        const groups = matches.groups;
        if (this.useSteam64 && groups.steamid) {
            try {
                const steamid = new SteamID(groups.steamid);
                if (steamid.isValid())
                    groups.steamid = steamid.getSteamID64()
            } //Ignore errors with parsing since they are usually tied to Console/Bots
            catch (error) { }
        }
        return {
            id: groups.steamid,
            name: groups.name,
            team: groups.team
        }
    }

    processLine(line: string) {
        const eventLine = line.slice(25)
        let time = this.makeTimestamp(line)
        if (!time) return
        time = this.checkAndUpdateTime(time);
        if (this.executeEvent(time, eventLine, this.playerTriggeredMain[0], this.playerTriggeredMain[1])) {
            for (const [eventName, eventProps] of this.playerTriggeredEvents) {
                const matched = this.executeEvent(time, eventLine, eventName, eventProps)
                if (matched) break;
            }
        }

        if (this.executeEvent(time, eventLine, this.worldMain[0], this.worldMain[1])) {
            for (const [eventName, eventProps] of this.worldEvents) {
                const matched = this.executeEvent(time, eventLine, eventName, eventProps)
                if (matched) break;
            }
        }
        for (const [eventName, eventProps] of this.events) {
            const matched = this.executeEvent(time, eventLine, eventName, eventProps);
            if (matched) break;
        }

    }

    executeEvent(time: number, eventLine: string, eventName: string, eventProps: IEventDefinition): Boolean {
        const matches = eventLine.match(eventProps.regexp);
        if (!matches) return false
        const props = new Map<string, string>()
        for (const match of [...eventLine.matchAll(PROPERTIES_EXPRESSION)]) {
            const key = match[1]
            const value = match[2]
            props.set(key, value)
        }
        if (!eventProps.createEvent) return false;
        const event: events.IEvent | null = eventProps.createEvent(matches.groups, props, time);
        if (!event) return false
        for (const m of this.modules) {
            const callback: IEventCallback = m[eventName]
            if (callback) callback.call(m, event)
        }
        return true
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

    private checkAndUpdateTime(timeIn: number): number {
        let time = timeIn + this.timeState.difference
        //If for some reason we go backwards in time
        if (this.timeState.previousTime > time) {
            //+= the difference in case we go backwards in time multiple times
            this.timeState.difference += this.timeState.previousTime - time;
        }
        //update previous time to be the timeIn + the difference
        this.timeState.previousTime = timeIn + this.timeState.difference;
        return this.timeState.previousTime;
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
