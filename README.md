# Logs.tf Parser

This is an updated version of the logs.tf parser which aims to recreate the parser currently used by logs.tf

This parser is currently being used for demoticks.tf

# Installation

Install it from npm:

    $ npm install steamid

# Brief Example
    const parser = require("logstf-parser");
    const LogsParser = new parser.LogParser();
    const lines = fs.readFileSync(filePath, "UTF-8").split("\n");
    const game = LogsParser.parseLines(lines) 
    console.log(game.toJson())

# Custom modules
One can also define custom modules to extract other events from the logfiles.
Each module must be a class which should contain a finish() method and must contain a toJson() method.
Example:

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
They can then be added to the pipeline like so:

    const LogsParser = new parser.LogParser();
    LogsParser.addModule(MyModule);

# List of hooks
- onDamage: [IDamageEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L66)
- onHeal: [IHealEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L75)
- onShot: [IShotEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L81)
- onShotHit: [IShotHitEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L86)
- onKill: [IKillEvent](https://github.com/TheBv/logstf-parser/blob/7dc1f46403d83f5945d29260604202097a7d5b8e/events.ts#L56)
- onAssist: [IAssistEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L91)
- onPickup: [IPickupEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L99)
- onSuicide: [ISuicideEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L103)
- onSpawn: [ISpawnEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L112)
- onRole: [IRoleEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L107)
- onCapture: [ICaptureEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L117)
- onMedicDeath: [IMedicDeathEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L125)
- onRoundStart: [IRoundStartEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L131)
- onRoundEnd: [IRoundEndEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L135)
- onGameOver: [IGameOverEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L149) //currently not implemented
- onJoinTeam: [IJoinTeamEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L153)//currently not implemented
- onDisconnect: [IDisconnectEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L162)//currently not implemented
- onCharge: [IChargeEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L75)
- onChat: [IChatEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L167)
- onBuild: [IBuildEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L172) //currently not implemented
- onFlag:             //currently not implemented
- onScore: [IRoundScoreEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L144)
- onPause: [IPauseEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L178)
- onUnpause: [IUnpauseEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L179)
- onMapLoad: [IMapLoadEvent](https://github.com/TheBv/logstf-parser/blob/master/events.ts#L189)