"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const xregexp_1 = __importDefault(require("xregexp"));
// TODO: MedicStats
// TODO: HighlightsModule
// TODO: CP/CTF support
// TODO: Class support without plugin
// TODO: Feign death
// TODO: Captures
const PLAYER_EXPRESSION = xregexp_1.default('^(?<name>.{1,80}?)<\\d{1,4}><(?<steamid>.{1,40})><(?<team>(Red|Blue|Spectator|Console))>');
const TIMESTAMP_EXPRESSION = /^L (\1\d{2})\/(\2\d{2})\/(\3\d{4}) - (\4\d{2}):(\5\d{2}):(\6\d{2})/;
const PROPERTIES_EXPRESSION = /\((\w{1,60}) "([^"]{1,60})"\)/;
function getFromPlayerString(playerString) {
    if (!playerString)
        throw new Error("Empty playerString");
    const matches = xregexp_1.default.exec(playerString, PLAYER_EXPRESSION);
    if (!matches)
        return null;
    return {
        id: matches.steamid,
        name: matches.name,
        team: matches.team
    };
}
class Game {
    constructor() {
        this.gameState = {
            isLive: false,
            mapName: null
        };
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
        ];
        this.events = new Map();
        this.events.set("onDamage", {
            regexp: xregexp_1.default('^"(?P<attacker>.+?)" triggered "damage"( against "(?P<victim>.+?)")?'),
            createEvent: function (regexpMatches, props, time) {
                const attacker = getFromPlayerString(regexpMatches.attacker);
                const victim = getFromPlayerString(regexpMatches.victim);
                const damage = parseInt(props.get('damage') || '0');
                const weapon = props.get('weapon');
                const headshot = parseInt(props.get('headshot') || '0') ? true : false;
                const airshot = props.get("airshot") === '1' ? true : false;
                if (!attacker)
                    return null;
                return {
                    timestamp: time,
                    attacker,
                    victim,
                    damage,
                    weapon,
                    headshot,
                    airshot
                };
            }
        });
        this.events.set("onHeal", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "healed" against "(?P<target>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const healer = getFromPlayerString(regexpMatches.player);
                const target = getFromPlayerString(regexpMatches.target);
                const healing = parseInt(props.get('healing') || '0');
                if (!healer || !target || healing < 1 || healing > 450)
                    return null;
                return {
                    timestamp: time,
                    healer,
                    target,
                    healing
                };
            }
        });
        // L 08/26/2018 - 23:06:46: "arekk<78><[U:1:93699014]><Red>" triggered "shot_fired" (weapon "gloves")
        this.events.set("onShot", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "shot_fired"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                const weapon = props.get('weapon');
                if (!player || !weapon)
                    return null;
                return {
                    timestamp: time,
                    player,
                    weapon,
                };
            }
        });
        this.events.set("onShotHit", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "shot_hit"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                const weapon = props.get('weapon');
                if (!player || !weapon)
                    return null;
                return {
                    timestamp: time,
                    player,
                    weapon,
                };
            }
        });
        this.events.set("onKill", {
            regexp: xregexp_1.default('^"(?P<attacker>.+?)" killed "(?P<victim>.+?)" with "(?P<weapon>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const attacker = getFromPlayerString(regexpMatches.attacker);
                const victim = getFromPlayerString(regexpMatches.victim);
                const weapon = regexpMatches.weapon;
                const isHeadshot = props.get("headshot") === '1' ? true : false;
                const isBackstab = props.get("ubercharge") === '1' ? true : false;
                const isAirshot = props.get("airshot") === '1' ? true : false;
                if (!attacker || !victim)
                    return null;
                return {
                    timestamp: time,
                    headshot: isHeadshot,
                    backstab: isBackstab,
                    airshot: isAirshot,
                    attacker,
                    victim,
                    weapon,
                };
            }
        });
        this.events.set("onAssist", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "kill assist" against "(?P<victim>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const assister = getFromPlayerString(regexpMatches.player);
                const victim = getFromPlayerString(regexpMatches.victim);
                if (!assister || !victim)
                    return null;
                const attackerPosition = props.get("attacker_position") || null;
                const assisterPosition = props.get("assister_position") || null;
                const victimPosition = props.get("victim_position") || null;
                return {
                    timestamp: time,
                    assister,
                    victim,
                    attackerPosition,
                    assisterPosition,
                    victimPosition
                };
            }
        });
        this.events.set("onPickup", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" picked up item "(?P<item>.{1,40}?)"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                const item = regexpMatches.item;
                const healingProp = props.get("healing");
                let healing = null;
                if (healingProp)
                    healing = parseInt(healingProp);
                return {
                    timestamp: time,
                    player,
                    item,
                    healing
                };
            }
        });
        this.events.set("onSuicide", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" committed suicide'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player
                };
            }
        });
        this.events.set("onSpawn", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" spawned as "(?P<role>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                let role = regexpMatches.role.toLowerCase();
                if (role === 'heavy')
                    role = 'heavyweapons';
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player,
                    role
                };
            }
        });
        this.events.set("onRole", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" changed role to "(?P<role>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                let role = regexpMatches.role.toLowerCase();
                if (role === 'heavy')
                    role = 'heavyweapons';
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player,
                    role
                };
            }
        });
        // (cp "0") (cpname "Blue Final Point") (numcappers "4") (player1 "yomps<76><[U:1:84024852]><Red>") (position1 "-3530 -1220 583") (player2 "b4nny<77><[U:1:10403381]><Red>") (position2 "-3570 -1311 583") (player3 "arekk<78><[U:1:93699014]><Red>") (position3 "-3509 -1157 576") (player4 "cookiejake<81><[U:1:84193779]><Red>") (position4 "-3521 -1306 583")
        this.events.set("onCapture", {
            regexp: xregexp_1.default('^Team "(?P<team>(Red|Blue)?)" triggered "pointcaptured'),
            createEvent: function (regexpMatches, props, time) {
                const pointId = parseInt(props.get('cp') || '-1') + 1;
                const pointName = props.get('cpname') || '';
                const input = regexpMatches.input + " "; //This is needed to avoid inconsistencies
                const CAPTURE_PLAYERS = /\(player\d{1,2} "(?<name>.{0,80}?)<\d{1,4}><(?<steamid>.{1,40})><(?<team2>(Red|Blue|Spectator|Console))>"\) \(position\d{1,2} ".{1,30}"\) /g;
                const matches = [...input.matchAll(CAPTURE_PLAYERS)];
                const players = [];
                if (parseInt(props.get('numcappers') || '0') !== matches.length) {
                    return null;
                }
                for (const match of matches) {
                    const player = getFromPlayerString(match[0]);
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
                };
            }
        });
        this.events.set("onMedicDeath", {
            regexp: xregexp_1.default('^"(?P<attacker>.+?)" triggered "medic_death" against "(?P<victim>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const attacker = getFromPlayerString(regexpMatches.attacker);
                const victim = getFromPlayerString(regexpMatches.victim);
                if (!attacker || !victim)
                    return null;
                const isDrop = props.get("ubercharge") === '1' ? true : false;
                return {
                    timestamp: time,
                    attacker,
                    victim,
                    isDrop,
                };
            }
        });
        this.events.set("onRoundStart", {
            regexp: xregexp_1.default('^World triggered "Round_Start"'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time
                };
            }
        });
        this.events.set("onRoundEnd", {
            regexp: xregexp_1.default('^World triggered "Round_(?P<type>Win|Stalemate)'),
            createEvent: function (regexpMatches, props, time) {
                const winner = props.get('winner') || null;
                return {
                    timestamp: time,
                    type: regexpMatches.type,
                    winner: winner
                };
            }
        });
        this.events.set("onGameOver", {
            regexp: xregexp_1.default('^World triggered "Game_Over" reason "(?<reason>.+)"'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                    reason: regexpMatches.reason
                };
            }
        });
        this.events.set("onJoinTeam", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" joined team "(?P<newteam>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const reason = props.get("reason") || "";
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    newTeam: regexpMatches.newteam,
                    player
                };
            }
        });
        this.events.set("onDisconnect", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" disconnected'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                const reason = props.get("reason") || "";
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player,
                    reason
                };
            }
        });
        this.events.set("onCharge", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "chargedeployed"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                const medigunType = props.get("medigun") || "medigun";
                return {
                    timestamp: time,
                    player,
                    medigunType
                };
            }
        });
        this.events.set("onChat", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" say "(?P<message>.{1,160}?)"'),
            createEvent: function (regexpMatches, props, time) {
                console.log(regexpMatches);
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                const message = regexpMatches.message;
                return {
                    timestamp: time,
                    message,
                    player,
                };
            }
        });
        this.events.set("onBuild", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "player_builtobject"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                const position = props.get("position") || null;
                const object = props.get("object");
                return {
                    timestamp: time,
                    builtObject: object,
                    player,
                    position
                };
            }
        });
        this.events.set("onObjectDestroyed", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "killedobject"'),
            createEvent: function (regexpMatches, props, time) {
                const attacker = getFromPlayerString(regexpMatches.player);
                const objectOwnerProps = props.get("objectowner");
                if (!attacker || !objectOwnerProps)
                    return null;
                const objectOwner = getFromPlayerString(objectOwnerProps);
                if (!objectOwner)
                    return null;
                return {
                    builtObject: props.get("object"),
                    weapon: props.get("weapon"),
                    attackerPosition: props.get("attacker_position") || null,
                    assist: props.get("assist") ? true : false,
                    assistPositon: props.get("assister_position") || null,
                    timestamp: time,
                    objectOwner,
                    attacker,
                };
            }
        });
        this.events.set("onFlag", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "flagevent"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                const position = props.get("position") || null;
                return {
                    timestamp: time,
                    type: props.get("event"),
                    player,
                    position
                };
            }
        });
        this.events.set("onScore", {
            regexp: xregexp_1.default('^Team "(?P<team>(Red|Blue))" (current|final) score "(?P<score>\\d+?)"'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                    team: regexpMatches.team,
                    score: regexpMatches.score,
                };
            }
        });
        this.events.set("onPause", {
            regexp: xregexp_1.default('^World triggered "Game_Paused'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                };
            }
        });
        this.events.set("onUnpause", {
            regexp: xregexp_1.default('^World triggered "Game_Unpaused'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                };
            }
        });
        this.events.set("onMapLoad", {
            regexp: xregexp_1.default('^Started map "(?P<mapname>.+?)'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                    mapName: regexpMatches.mapname
                };
            }
        });
        this.events.set("onFirstHeal", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "first_heal_after_spawn"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                const timeTaken = props.get('time');
                if (!player || !timeTaken)
                    return null;
                return {
                    timestamp: time,
                    time: parseFloat(timeTaken),
                    player,
                };
            }
        });
        this.events.set("onChargeReady", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "chargeready"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player,
                };
            }
        });
        this.events.set("onChargeEnded", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "chargeended"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                const duration = props.get('duration');
                if (!player || !duration)
                    return null;
                return {
                    timestamp: time,
                    duration: parseFloat(duration),
                    player,
                };
            }
        });
        this.events.set("onMedicDeathEx", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "medic_death_ex"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                const uberpct = props.get('uberpct');
                if (!player || !uberpct)
                    return null;
                return {
                    timestamp: time,
                    uberpct: parseInt(uberpct),
                    player,
                };
            }
        });
        this.events.set("onEmptyUber", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "empty_uber"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player,
                };
            }
        });
        this.events.set("onLostUberAdv", {
            regexp: xregexp_1.default('^"(?P<player>.+?)" triggered "lost_uber_advantage"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                const timeLost = props.get('time');
                if (!player || !timeLost)
                    return null;
                return {
                    timestamp: time,
                    time: parseFloat(timeLost),
                    player,
                };
            }
        });
    }
    createEvent(eventType, regexpMatches, props, time) {
        const eventDefinition = this.events.get(eventType);
        if (!eventDefinition || !eventDefinition.createEvent)
            return null;
        const event = eventDefinition.createEvent(regexpMatches, props, time);
        return event;
    }
    processLine(line) {
        const eventLine = line.slice(25);
        for (let [eventName, eventProps] of this.events.entries()) {
            const matches = xregexp_1.default.exec(eventLine, eventProps.regexp);
            if (!matches)
                continue;
            const time = this.makeTimestamp(line);
            if (!time)
                return;
            const props = new Map();
            xregexp_1.default.forEach(eventLine, PROPERTIES_EXPRESSION, function (match, i) {
                const key = match[1];
                const value = match[2];
                props.set(key, value);
            });
            const event = this.createEvent(eventName, matches, props, time);
            if (!event)
                return;
            for (const m of this.modules) {
                const callback = m[eventName];
                if (callback)
                    callback.call(m, event);
            }
        }
    }
    makeTimestamp(line) {
        const t = TIMESTAMP_EXPRESSION.exec(line);
        if (!t)
            return null;
        const year = parseInt(t[3]);
        const month = parseInt(t[1]) - 1;
        const day = parseInt(t[2]);
        const hours = parseInt(t[4]);
        const minutes = parseInt(t[5]);
        const seconds = parseInt(t[6]);
        const time = new Date(year, month, day, hours, minutes, seconds).getTime() / 1000;
        return time;
    }
    finish() {
        for (const m of this.modules) {
            if (m.finish)
                m.finish();
        }
    }
    toJSON() {
        let output = {};
        for (const m of this.modules) {
            if (m.toJSON)
                output[m.identifier] = m.toJSON();
        }
        return output;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map