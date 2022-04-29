# Logs.tf Parser

[![Build](https://github.com/thebv/logstf-parser/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/thebv/logstf-parser/actions/workflows/build.yml)

This is an updated version of the logs.tf parser which aims to recreate the parser currently used by logs.tf as closely as possible while still fixing/improving upon various issues.

This parser is currently being used for demoticks.tf

# Installation

Install it from npm:

    $ npm install logstf-parser

# Brief Example
```ts
const parser = require("logstf-parser");
const LogsParser = new parser.LogParser();
const lines = fs.readFileSync(filePath, "UTF-8").split("\n");
const game = LogsParser.parseLines(lines) 
console.log(game.toJson())
console.log(game.toLogstf()) 
// Returns a format like the one logs.tf json provides this however requires one to have some
// of the default modules loaded
```
# Adding modules
By default only the GameStateModule will be loaded other modules can be included like so:
```ts
const LogsParser = new parser.LogParser();
 //Note that we're passing the class and not an instance!
LogsParser.addModule(parser.defaultModules.KillstreakModule);
//To load all modules one can iterate through the object e.g.:
for (const module of Object.values(parser.defaultModules)){
    LogsParser.addModule(module);
}
//If you want to define your own GameStateModule you should disable the provided one like this:
LogsParser.useCustomGameState();
```
Similar to this you can create and load custom modules.
# Custom modules
One can also define custom modules to extract other events from the logfiles.
Each module must be a class which should contain an identifier as well as a finish() and toJson() method.
Example:
```ts
import {events} from "logstf-parser";
import {IGameState} from "logstf-parser";
class MyModule implements events.IStats {
    public identifier: string
    private killEvents: events.IKillEvent[]
    private gameStartTime: number | null

    constructor(gameState: IGameState) {
        this.identifier = 'myModule'
        this.killEvents = []
        this.gameStartTime = null
    }

    onRoundStart(event: events.IRoundStartEvent) {
        if (!this.gameStartTime) this.gameStartTime = event.timestamp
    }

    onKill(event: events.IKillEvent) {
        if (!this.gameStartTime) return;
        killEvents.push(event)
    }

    finish(){
        //Get's called after every line has been processed
    }

    toJSON(): events.IKillEvent[] {
        return this.killEvents
    }

}
```
# List of events
- onDamage: [IDamageEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L92)
- onHeal: [IHealEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L103)
- onShot: [IShotEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L109)
- onShotHit: [IShotHitEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L114)
- onKill: [IKillEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L82)
- onAssist: [IAssistEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L119)
- onPickup: [IPickupEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L127)
- onSuicide: [ISuicideEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L139)
- onSpawn: [ISpawnEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L148)
- onRole: [IRoleEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L143)
- onCapture: [ICaptureEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L153)
- onMedicDeath: [IMedicDeathEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L161)
- onMiniRoundStart: [IRoundStartEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L178)
- onMiniRoundSelected: [IMiniRoundSelected](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L172)
- onMiniRoundWin: [IMiniRoundWin](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L185)
- onMiniRoundLength: [IRoundLengthEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L194)
- onRoundStart: [IRoundStartEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L178)
- onRoundSetupBegin: [IRoundSetupBegin](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L190)
- onRoundSetupEnd: [IRoundSetupEnd](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L192)
- onRoundEnd: [IRoundEndEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L180)
- onGameOver: [IGameOverEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L203)
- onJoinTeam: [IJoinTeamEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L207)
- onDisconnect: [IDisconnectEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L213)
- onCharge: [IChargeEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L217)
- onChat: [IChatEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L245)
- onBuild: [IBuildEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L250)
- onObjectDestroyed: [IObjectDestroyedEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L256)
- onFlag: [IFlagEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L133)
- onScore: [IRoundScoreEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L198)
- onPause: [IPauseEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L266)
- onUnpause: [IUnpauseEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L267)
- onMapLoad: [IMapLoadEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L268)
- onFirstHeal: [IFirstHealEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L222)
- onChargeReady: [IChargeReadyEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L227)
- onChargeEnded: [IChargeEndedEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L231)
- onMedicDeathEx: [IMedicDeathExEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L163)
- onEmptyUber: [IEmptyUberEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L236)
- onLostUberAdv: [ILostUberAdvantageEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L240)
- onTriggered: [ITriggeredEvent](https://github.com/TheBv/logstf-parser/blob/master/src/interfaces/events.ts#L271)
