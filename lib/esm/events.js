export var Role;
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
})(Role || (Role = {}));
export var Team;
(function (Team) {
    Team["Red"] = "Red";
    Team["Blue"] = "Blue";
    Team["Spectator"] = "Spectator";
})(Team || (Team = {}));
export var FlagEvent;
(function (FlagEvent) {
    FlagEvent["Dropped"] = "dropped";
    FlagEvent["PickedUp"] = "picked up";
    FlagEvent["Captured"] = "captured";
    FlagEvent["Defended"] = "defended";
})(FlagEvent || (FlagEvent = {}));
export var Building;
(function (Building) {
    Building["Sentry"] = "OBJ_SENTRYGUN";
    Building["Dispenser"] = "OBJ_DISPENSER";
    Building["Teleporter"] = "OBJ_TELEPORTER";
})(Building || (Building = {}));
//# sourceMappingURL=events.js.map