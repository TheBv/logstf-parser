import { type } from "os";
import * as events from './events'
import {Game, IGameState} from './Game';

export class LogParser {
    private modules : {new(gameState: IGameState): events.IStats }[]
    constructor(){
        this.modules = []
    }
    parseLines(lines: string[]): Game {
        const game = new Game()
        for (const module of this.modules){
            game.modules.push(new module(game.gameState));
        }
        lines.forEach(line => game.processLine(line))
        game.finish()
        return game
    }
    addModule(moduleClass: {new(gameState: IGameState): events.IStats}) {
        this.modules.push(moduleClass);
    }
}
//Export interfaces 
export * as events from './events';
