import * as events from './events'
import GameStateModule from "./modules/GameStateModule";
import { Game, IGameState } from './Game';

export class LogParser {
    private modules: {
        new(gameState: IGameState): events.IStats 
    }[]

    private useCustom: boolean

    constructor() {
        this.modules = []
        this.useCustom = false
    }

    useCustomGameState(){
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

    addModule(moduleClass: { new (gameState: IGameState): events.IStats }) {
        this.modules.push(moduleClass);
    }

    getModules(): { new (gameState: IGameState): events.IStats }[]{
        return this.modules;
    }
}

//Export interfaces 
export * as events from './events';
export * from './modules/ModuleHolder';
export { IGameState, PlayerInfo } from './Game';
