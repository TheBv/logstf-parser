"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultModules = void 0;
const ChatModule_1 = require("./ChatModule");
const GameStateModule_1 = require("./GameStateModule");
const HealSpreadModule_1 = require("./HealSpreadModule");
const KillstreakModule_1 = require("./KillstreakModule");
const PlayerClassStatsModule_1 = require("./PlayerClassStatsModule");
const PlayerStatsModule_1 = require("./PlayerStatsModule");
const PvCModule_1 = require("./PvCModule");
const PvPModule_1 = require("./PvPModule");
const RealDamageModule_1 = require("./RealDamageModule");
const TeamStatsModule_1 = require("./TeamStatsModule");
const defaultModules = {
    ChatModule: ChatModule_1.default,
    GameStateModule: GameStateModule_1.default,
    HealSpreadModule: HealSpreadModule_1.default,
    KillstreakModule: KillstreakModule_1.default,
    PlayerClassStatsModule: PlayerClassStatsModule_1.default,
    PlayerStatsModule: PlayerStatsModule_1.default,
    PvCModule: PvCModule_1.default,
    PvPModule: PvPModule_1.default,
    RealDamageModule: RealDamageModule_1.default,
    TeamStatsModule: TeamStatsModule_1.default
};
exports.defaultModules = defaultModules;
//# sourceMappingURL=ModuleHolder.js.map