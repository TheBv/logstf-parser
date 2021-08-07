# Logs.tf Parser

This is an updated version of the logs.tf parser which aims to recreate the parser currently used by logs.tf

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
LogsParser.useCustomGameState(true);
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
- onDamage: [IDamageEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L91)
- onHeal: [IHealEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L100)
- onShot: [IShotEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L106)
- onShotHit: [IShotHitEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L111)
- onKill: [IKillEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L82)
- onAssist: [IAssistEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L116)
- onPickup: [IPickupEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L124)
- onSuicide: [ISuicideEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L136)
- onSpawn: [ISpawnEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L145)
- onRole: [IRoleEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L140)
- onCapture: [ICaptureEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L150)
- onMedicDeath: [IMedicDeathEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L158)
- onMiniRoundStart: [IRoundStartEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L173)
- onMiniRoundSelected: [IMiniRoundSelected](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L169)
- onMiniRoundWin: [IMiniRoundWin](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L180)
- onMiniRoundLength: [IRoundLengthEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L189)
- onRoundStart: [IRoundStartEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L173)
- onRoundSetupBegin: [IRoundSetupBegin](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L185)
- onRoundSetupEnd: [IRoundSetupEnd](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L187)
- onRoundEnd: [IRoundEndEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L175)
- onGameOver: [IGameOverEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L198)
- onJoinTeam: [IJoinTeamEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L202)
- onDisconnect: [IDisconnectEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L207)
- onCharge: [IChargeEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L212)
- onChat: [IChatEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L240)
- onBuild: [IBuildEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L245)
- onObjectDestroyed: [IObjectDestroyedEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L251)
- onFlag: [IFlagEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L130)
- onScore: [IRoundScoreEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L193)
- onPause: [IPauseEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L261)
- onUnpause: [IUnpauseEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L262)
- onMapLoad: [IMapLoadEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L263)
- onFirstHeal: [IFirstHealEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L217)
- onChargeReady: [IChargeReadyEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L222)
- onChargeEnded: [IChargeEndedEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L226)
- onMedicDeathEx: [IMedicDeathExEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L158)
- onEmptyUber: [IEmptyUberEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L231)
- onLostUberAdv: [ILostUberAdvantageEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L235)
- onTriggered: [ITriggeredEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L266)