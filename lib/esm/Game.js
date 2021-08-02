"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
// TODO: MedicStats
// TODO: HighlightsModule
// TODO: CP/CTF support
// TODO: Class support without plugin
// TODO: Feign death
// TODO: Captures
const PLAYER_EXPRESSION = /'^(?<name>.{1,80}?)<\\d{1,4}><(?<steamid>.{1,40})><(?<team>(Red|Blue|Spectator|Console))>'/;
const TIMESTAMP_EXPRESSION = /^L (\1\d{2})\/(\2\d{2})\/(\3\d{4}) - (\4\d{2}):(\5\d{2}):(\6\d{2})/;
const PROPERTIES_EXPRESSION = /\((\w{1,60}) "([^"]{1,60})"\)/g;
function getFromPlayerString(playerString) {
    if (!playerString)
        throw new Error("Empty playerString");
    const matches = playerString.match(PLAYER_EXPRESSION);
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
            regexp: /"(?<attacker>.+?)" triggered "damage" against "(?<victim>.+?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const attacker = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.attacker);
                const victim = getFromPlayerString((_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.victim);
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
            regexp: /"(?<player>.+?)" triggered "healed" against "(?<target>.+?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const healer = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                const target = getFromPlayerString((_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.target);
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
            regexp: /"(?<player>.+?)" triggered "shot_fired"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
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
            regexp: /"(?<player>.+?)" triggered "shot_hit"'/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
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
            regexp: /"(?<attacker>.+?)" killed "(?<victim>.+?)" with "(?<weapon>.+?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b, _c;
                const attacker = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.attacker);
                const victim = getFromPlayerString((_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.victim);
                const weapon = (_c = regexpMatches.groups) === null || _c === void 0 ? void 0 : _c.weapon;
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
            regexp: /"(?<player>.+?)" triggered "kill assist" against "(?<victim>.+?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const assister = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                const victim = getFromPlayerString((_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.victim);
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
            regexp: /"(?<player>.+?)" picked up item "(?<item>.{1,40}?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                if (!player)
                    return null;
                const item = (_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.item;
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
            regexp: /"(?<player>.+?)" committed suicide'/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player
                };
            }
        });
        this.events.set("onSpawn", {
            regexp: /"(?<player>.+?)" spawned as "(?<role>.+?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                let role = (_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.role.toLowerCase();
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
            regexp: /"(?<player>.+?)" changed role to "(?<role>.+?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                let role = (_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.role.toLowerCase();
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
            regexp: /Team "(?<team>(Red|Blue)?)" triggered "pointcaptured'/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const pointId = parseInt(props.get('cp') || '-1') + 1;
                const pointName = props.get('cpname') || '';
                const input = ((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.input) + " "; //This is needed to avoid inconsistencies
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
                    timestamp: time,
                    team: (_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.team,
                    numCappers: parseInt(props.get('numcappers') || '0'),
                    pointId,
                    pointName,
                    players,
                };
            }
        });
        this.events.set("onMedicDeath", {
            regexp: /"(?<attacker>.+?)" triggered "medic_death" against "(?<victim>.+?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const attacker = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.attacker);
                const victim = getFromPlayerString((_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.victim);
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
            regexp: /World triggered "Round_Start"/,
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time
                };
            }
        });
        this.events.set("onRoundEnd", {
            regexp: /World triggered "Round_(?<type>Win|Stalemate)/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const winner = props.get('winner') || null;
                return {
                    timestamp: time,
                    type: (_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.type,
                    winner: winner
                };
            }
        });
        this.events.set("onGameOver", {
            regexp: /World triggered "Game_Over" reason "(?<reason>.+)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                return {
                    timestamp: time,
                    reason: (_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.reason
                };
            }
        });
        this.events.set("onJoinTeam", {
            regexp: /"(?<player>.+?)" joined team "(?<newteam>.+?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const reason = props.get("reason") || "";
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    newTeam: (_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.newteam,
                    player: player
                };
            }
        });
        this.events.set("onDisconnect", {
            regexp: /"(?<player>.+?)" disconnected/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                const reason = props.get("reason") || "";
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                    reason: reason
                };
            }
        });
        this.events.set("onCharge", {
            regexp: /"(?<player>.+?)" triggered "chargedeployed"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
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
            regexp: /"(?<player>.+?)" say "(?<message>.{1,160}?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                if (!player)
                    return null;
                const message = (_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.message;
                return {
                    timestamp: time,
                    player,
                    message,
                };
            }
        });
        this.events.set("onBuild", {
            regexp: /"(?<player>.+?)" triggered "player_builtobject"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                if (!player)
                    return null;
                const position = props.get("position") || null;
                const object = props.get("object");
                return {
                    player: player,
                    timestamp: time,
                    builtObject: object,
                    position: position
                };
            }
        });
        this.events.set("onObjectDestroyed", {
            regexp: /"(?<player>.+?)" triggered "killedobject"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const attacker = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                const objectOwnerProps = props.get("objectowner");
                if (!attacker || !objectOwnerProps)
                    return null;
                const objectOwner = getFromPlayerString(objectOwnerProps);
                if (!objectOwner)
                    return null;
                return {
                    attacker: attacker,
                    builtObject: props.get("object"),
                    objectOwner: objectOwner,
                    weapon: props.get("weapon"),
                    attackerPosition: props.get("attacker_position") || null,
                    assist: props.get("assist") ? true : false,
                    assistPositon: props.get("assister_position") || null,
                    timestamp: time,
                };
            }
        });
        this.events.set("onFlag", {
            regexp: /"(?<player>.+?)" triggered "flagevent"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                if (!player)
                    return null;
                const position = props.get("position") || null;
                return {
                    player: player,
                    timestamp: time,
                    type: props.get("event"),
                    position: position
                };
            }
        });
        this.events.set("onScore", {
            regexp: /Team "(?<team>(Red|Blue))" (current|final) score "(?<score>\\d+?)"/,
            createEvent: function (regexpMatches, props, time) {
                var _a, _b;
                return {
                    timestamp: time,
                    team: (_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.team,
                    score: (_b = regexpMatches.groups) === null || _b === void 0 ? void 0 : _b.score,
                };
            }
        });
        this.events.set("onPause", {
            regexp: /World triggered "Game_Paused"/,
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                };
            }
        });
        this.events.set("onUnpause", {
            regexp: /World triggered "Game_Unpaused'/,
            createEvent: function (regexpMatches, props, time) {
                return {
                    timestamp: time,
                };
            }
        });
        this.events.set("onMapLoad", {
            regexp: /Started map "(?<mapname>.+?)/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                return {
                    timestamp: time,
                    mapName: (_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.mapname
                };
            }
        });
        this.events.set("onFirstHeal", {
            regexp: /"(?<player>.+?)" triggered "first_heal_after_spawn"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                const timeTaken = props.get('time');
                if (!player || !timeTaken)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                    time: parseFloat(timeTaken)
                };
            }
        });
        this.events.set("onChargeReady", {
            regexp: /"(?<player>.+?)" triggered "chargeready"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                };
            }
        });
        this.events.set("onChargeEnded", {
            regexp: /"(?<player>.+?)" triggered "chargeended"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                const duration = props.get('duration');
                if (!player || !duration)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                    duration: parseFloat(duration),
                };
            }
        });
        this.events.set("onMedicDeathEx", {
            regexp: /"(?<player>.+?)" triggered "medic_death_ex"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                const uberpct = props.get('uberpct');
                if (!player || !uberpct)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                    uberpct: parseInt(uberpct),
                };
            }
        });
        this.events.set("onEmptyUber", {
            regexp: /"(?<player>.+?)" triggered "empty_uber"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                if (!player)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                };
            }
        });
        this.events.set("onLostUberAdv", {
            regexp: /"(?<player>.+?)" triggered "lost_uber_advantage"/,
            createEvent: function (regexpMatches, props, time) {
                var _a;
                const player = getFromPlayerString((_a = regexpMatches.groups) === null || _a === void 0 ? void 0 : _a.player);
                const timeLost = props.get('time');
                if (!player || !timeLost)
                    return null;
                return {
                    timestamp: time,
                    player: player,
                    time: parseFloat(timeLost),
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
            const matches = eventLine.match(eventProps.regexp);
            if (!matches)
                continue;
            const time = this.makeTimestamp(line);
            if (!time)
                return;
            const props = new Map();
            for (const [key, value] of eventLine.matchAll(PROPERTIES_EXPRESSION)) {
                props.set(key, value);
            }
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