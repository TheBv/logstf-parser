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
# Custom modules
One can also define custom modules to extract other events from the logfiles.
Each module must be a class which should contain an identifier as well as a finish() and toJson() method.
Example:
```ts
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
They can then be added to the pipeline like so:
```ts
const LogsParser = new parser.LogParser();
LogsParser.addModule(MyModule); //Note that we're passing the class and not an instance!
```
# List of events
- onDamage: [IDamageEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L84)
- onHeal: [IHealEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L93)
- onShot: [IShotEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L99)
- onShotHit: [IShotHitEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L104)
- onKill: [IKillEvent](https://github.com/TheBv/logstf-parser/blob/7dc1f46403d83f5945d29260604202097a7d5b8e/events.ts#L74)
- onAssist: [IAssistEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L109)
- onPickup: [IPickupEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L117)
- onSuicide: [ISuicideEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L129)
- onSpawn: [ISpawnEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L138)
- onRole: [IRoleEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L133)
- onCapture: [ICaptureEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L143)
- onMedicDeath: [IMedicDeathEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L151)
- onRoundStart: [IRoundStartEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L162)
- onRoundEnd: [IRoundEndEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L166)
- onGameOver: [IGameOverEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L180)
- onJoinTeam: [IJoinTeamEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L184)
- onDisconnect: [IDisconnectEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L189)
- onCharge: [IChargeEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L194)
- onChat: [IChatEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L222)
- onBuild: [IBuildEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L227)
- onObjectDestroyed: [IObjectDestroyedEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L233)
- onFlag: [IFlagEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L123)
- onScore: [IRoundScoreEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L175)
- onPause: [IPauseEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L243)
- onUnpause: [IUnpauseEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L244)
- onMapLoad: [IMapLoadEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L245)
- onFirstHeal: [IFirstHealEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L199)
- onChargeReady: [IChargeReadyEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L204)
- onChargeEnded: [IChargeEndedEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L208)
- onMedicDeathEx: [IMedicDeathExEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L157)
- onEmptyUber: [IEmptyUberEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L213)
- onLostUberAdv: [ILostUberAdvantageEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L217)