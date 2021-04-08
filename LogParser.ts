import * as events from './events'
import {Game} from './Game';


export class LogParser {
    modules : events.IStats[]
    constructor(){
        this.modules = []
    }
    parseLines(lines: string[]): Game {
        const game = new Game()
        for (const module of this.modules){
            game.modules.push(module);
        }
        lines.forEach(line => game.processLine(line))
        game.finish()
        return game
    }
    addModule(moduleInstance: events.IStats) {
        this.modules.push(moduleInstance);
    }
}
