"use strict";
/// <reference path="./node_modules/@types/xregexp/index.d.ts" />
/// <reference path="./node_modules/@types/steamid/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const XRegExp = require("xregexp");
const PlayerStatsModule_1 = require("./modules/PlayerStatsModule");
const GameStateModule_1 = require("./modules/GameStateModule");
const TeamStatsModule_1 = require("./modules/TeamStatsModule");
const PvPModule_1 = require("./modules/PvPModule");
const PvCModule_1 = require("./modules/PvCModule");
const ChatModule_1 = require("./modules/ChatModule");
const RealDamageModule_1 = require("./modules/RealDamageModule");
const PlayerClassStatsModule_1 = require("./modules/PlayerClassStatsModule");
const KillstreakModule_1 = require("./modules/KillstreakModule");
// TODO: MedicStats
// TODO: HighlightsModule
// TODO: CP/CTF support
// TODO: Class support without plugin
// TODO: Feign death
// TODO: Captures
const PLAYER_EXPRESSION = XRegExp('^(?<name>.{1,80}?)<\\d{1,4}><(?<steamid>.{1,40})><(?<team>(Red|Blue|Spectator|Console))>');
const TIMESTAMP_EXPRESSION = /^L (\1\d{2})\/(\2\d{2})\/(\3\d{4}) - (\4\d{2}):(\5\d{2}):(\6\d{2})/;
const PROPERTIES_EXPRESSION = /\((\w{1,60}) "([^"]{1,60})"\)/;
function getFromPlayerString(playerString) {
    if (!playerString)
        throw new Error("Empty playerString");
    const matches = XRegExp.exec(playerString, PLAYER_EXPRESSION);
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
            new GameStateModule_1.default(this.gameState),
            new TeamStatsModule_1.default(this.gameState),
            new PlayerStatsModule_1.default(this.gameState),
            new PlayerClassStatsModule_1.default(this.gameState),
            new PvPModule_1.default(this.gameState),
            new PvCModule_1.default(this.gameState),
            new RealDamageModule_1.default(this.gameState),
            new ChatModule_1.default(this.gameState),
            new KillstreakModule_1.default(this.gameState)
        ];
        this.events = new Map();
        this.events.set("onDamage", {
            regexp: XRegExp('^"(?P<attacker>.+?)" triggered "damage"( against "(?P<victim>.+?)")?'),
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
                    attacker: attacker,
                    victim: victim,
                    damage: damage,
                    weapon: weapon,
                    headshot: headshot,
                    airshot: airshot
                };
            }
        });
        this.events.set("onHeal", {
            regexp: XRegExp('^"(?P<player>.+?)" triggered "healed" against "(?P<target>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const healer = getFromPlayerString(regexpMatches.player);
                const target = getFromPlayerString(regexpMatches.target);
                const healing = parseInt(props.get('healing') || '0');
                if (!healer || !target || healing < 1 || healing > 450)
                    return null;
                return {
                    timestamp: time,
                    healer: healer,
                    target: target,
                    healing: healing
                };
            }
        });
        // L 08/26/2018 - 23:06:46: "arekk<78><[U:1:93699014]><Red>" triggered "shot_fired" (weapon "gloves")
        this.events.set("onShot", {
            regexp: XRegExp('^"(?P<player>.+?)" triggered "shot_fired"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                const weapon = props.get('weapon');
                if (!player || !weapon)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                    weapon: weapon,
                };
            }
        });
        this.events.set("onShotHit", {
            regexp: XRegExp('^"(?P<player>.+?)" triggered "shot_hit"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                const weapon = props.get('weapon');
                if (!player || !weapon)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                    weapon: weapon,
                };
            }
        });
        this.events.set("onKill", {
            regexp: XRegExp('^"(?P<attacker>.+?)" killed "(?P<victim>.+?)" with "(?P<weapon>.+?)"'),
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
                    attacker: attacker,
                    victim: victim,
                    weapon: weapon,
                    headshot: isHeadshot,
                    backstab: isBackstab,
                    airshot: isAirshot,
                };
            }
        });
        this.events.set("onAssist", {
            regexp: XRegExp('^"(?P<player>.+?)" triggered "kill assist" against "(?P<victim>.+?)"'),
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
                    assister: assister,
                    victim: victim,
                    attackerPosition: attackerPosition,
                    assisterPosition: assisterPosition,
                    victimPosition: victimPosition
                };
            }
        });
        this.events.set("onPickup", {
            regexp: XRegExp('^"(?P<player>.+?)" picked up item "(?P<item>.{1,40}?)"'),
            createEvent: function (regexpMatches, props, time) {
                const item = regexpMatches.item;
                return {
                    timestamp: time,
                    item: item
                };
            }
        });
        this.events.set("onSuicide", {
            regexp: XRegExp('^"(?P<player>.+?)" committed suicide'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player: player
                };
            }
        });
        this.events.set("onSpawn", {
            regexp: XRegExp('^"(?P<player>.+?)" spawned as "(?P<role>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                let role = regexpMatches.role.toLowerCase();
                if (role === 'heavy')
                    role = 'heavyweapons';
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                    role: role
                };
            }
        });
        this.events.set("onRole", {
            regexp: XRegExp('^"(?P<player>.+?)" changed role to "(?P<role>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                let role = regexpMatches.role.toLowerCase();
                if (role === 'heavy')
                    role = 'heavyweapons';
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                    role: role
                };
            }
        });
        // (cp "0") (cpname "Blue Final Point") (numcappers "4") (player1 "yomps<76><[U:1:84024852]><Red>") (position1 "-3530 -1220 583") (player2 "b4nny<77><[U:1:10403381]><Red>") (position2 "-3570 -1311 583") (player3 "arekk<78><[U:1:93699014]><Red>") (position3 "-3509 -1157 576") (player4 "cookiejake<81><[U:1:84193779]><Red>") (position4 "-3521 -1306 583")
        this.events.set("onCapture", {
            regexp: XRegExp('^Team "(?P<team>(Red|Blue)?)" triggered "pointcaptured'),
            createEvent: function (regexpMatches, props, time) {
                var _a;
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
                    players.push(((_a = getFromPlayerString(match[0])) === null || _a === void 0 ? void 0 : _a.id) || "");
                }
                return {
                    timestamp: time,
                    team: regexpMatches.team,
                    pointId: pointId,
                    pointName: pointName,
                    numCappers: parseInt(props.get('numcappers') || '0'),
                    playerIds: players,
                };
            }
        });
        this.events.set("onMedicDeath", {
            regexp: XRegExp('^"(?P<attacker>.+?)" triggered "medic_death" against "(?P<victim>.+?)"'),
            createEvent: function (regexpMatches, props, time) {
                const attacker = getFromPlayerString(regexpMatches.attacker);
                const victim = getFromPlayerString(regexpMatches.victim);
                if (!attacker || !victim)
                    return null;
                const isDrop = props.get("ubercharge") === '1' ? true : false;
                return {
                    timestamp: time,
                    attacker: attacker,
                    victim: victim,
                    isDrop: isDrop,
                };
            }
        });
        this.events.set("onRoundStart", {
            regexp: XRegExp('^World triggered "Round_Start"'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time
                };
            }
        });
        this.events.set("onRoundEnd", {
            regexp: XRegExp('^World triggered "Round_(?P<type>Win|Stalemate)'),
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
            createEvent: null,
            regexp: XRegExp('^World triggered "Game_Over"'),
        });
        this.events.set("onJoinTeam", {
            createEvent: null,
            regexp: XRegExp('^"(?P<player>.+?)" joined team "(?P<newteam>.+?)"'),
        });
        this.events.set("onDisconnect", {
            createEvent: null,
            regexp: XRegExp('^"(?P<player>.+?)" disconnected'),
        });
        this.events.set("onCharge", {
            regexp: XRegExp('^"(?P<player>.+?)" triggered "chargedeployed"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                const medigunType = props.get("medigun") || "medigun";
                return {
                    player: player,
                    timestamp: time,
                    medigunType: medigunType
                };
            }
        });
        this.events.set("onChat", {
            regexp: XRegExp('^"(?P<player>.+?)" say "(?P<message>.{1,160}?)"'),
            createEvent: function (regexpMatches, props, time) {
                const player = getFromPlayerString(regexpMatches.player);
                if (!player)
                    return null;
                const message = regexpMatches.message;
                return {
                    timestamp: time,
                    player: player,
                    message: message,
                };
            }
        });
        this.events.set("onBuild", {
            createEvent: null,
            regexp: XRegExp('^"(?P<player>.+?)" triggered "builtobject"'),
        });
        this.events.set("onFlag", {
            createEvent: null,
            regexp: XRegExp('^"(?P<player>.+?)" triggered "flagevent"'),
        });
        this.events.set("onScore", {
            regexp: XRegExp('^Team "(?P<team>(Red|Blue))" (current|final) score "(?P<score>\\d+?)"'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                    team: regexpMatches.team,
                    score: regexpMatches.score,
                };
            }
        });
        this.events.set("onPause", {
            regexp: XRegExp('^World triggered "Game_Paused'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                };
            }
        });
        this.events.set("onUnpause", {
            regexp: XRegExp('^World triggered "Game_Unpaused'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                };
            }
        });
        this.events.set("onMapLoad", {
            regexp: XRegExp('^Started map "(?P<mapname>.+?)'),
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                    mapName: regexpMatches.mapname
                };
            }
        });
        // medic_firstheal: XRegExp('""" triggered "first_heal_after_spawn")
        // medic_chargeready: XRegExp('"" triggered "chargeready"')
        // medic_death_ex: XRegExp('"" triggered "medic_death_ex"')
        // medic_chargeended: XRegExp('"" triggered "chargeended"')
        // medic_emptyuber: XRegExp('"" triggered "empty_uber"')
        // medic_lostadvantage: XRegExp('"" triggered "lost_uber_advantage"')
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
            const matches = XRegExp.exec(eventLine, eventProps.regexp);
            if (!matches)
                continue;
            const time = this.makeTimestamp(line);
            if (!time)
                return;
            const props = new Map();
            XRegExp.forEach(eventLine, PROPERTIES_EXPRESSION, function (match, i) {
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
            output[m.identifier] = m.toJSON();
        }
        return output;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map