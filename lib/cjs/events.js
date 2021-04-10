"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Building = exports.FlagEvent = exports.Team = exports.Role = void 0;
var Role;
(function (Role) {
    Role["Scout"] = "scout";
    Role["Soldier"] = "soldier";
    Role["Pyro"] = "pyro";
    Role["Demoman"] = "demoman";
    Role["Heavy"] = "heavyweapons";
    Role["Engineer"] = "engineer";
    Role["Medic"] = "medic";
    Role["Sniper"] = "sniper";
    Role["Spy"] = "spy";
})(Role = exports.Role || (exports.Role = {}));
var Team;
(function (Team) {
    Team["Red"] = "Red";
    Team["Blue"] = "Blue";
    Team["Spectator"] = "Spectator";
})(Team = exports.Team || (exports.Team = {}));
var FlagEvent;
(function (FlagEvent) {
    FlagEvent["Dropped"] = "dropped";
    FlagEvent["PickedUp"] = "picked up";
    FlagEvent["Captured"] = "captured";
})(FlagEvent = exports.FlagEvent || (exports.FlagEvent = {}));
var Building;
(function (Building) {
    Building["Sentry"] = "OBJ_SENTRYGUN";
    Building["Dispenser"] = "OBJ_DISPENSER";
    Building["Teleporter"] = "OBJ_TELEPORTER";
})(Building = exports.Building || (exports.Building = {}));
//# sourceMappingURL=events.js.map