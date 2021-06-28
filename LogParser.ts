import * as events from './events'
import {Game, IGameState} from './Game';
import GameStateModule from "./modules/GameStateModule";

export class LogParser {
    private modules : {new(gameState: IGameState): events.IStats }[]
    private useCustom : boolean
    constructor(){
        this.modules = []
        this.useCustom = false
    }
    useCustomGameState(bool : boolean){
        this.useCustom = true
    }
    parseLines(lines: string[]): Game {
        const game = new Game()
        if (!this.useCustom){
            game.modules.push(new GameStateModule(game.gameState))
        }
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
    getModules(): {new(gameState: IGameState): events.IStats }[]{
        return this.modules;
    }
}
//Export interfaces 
export * as events from './events';
export {IGameState,PlayerInfo} from './Game';
export * from './modules/ModuleHolder';
