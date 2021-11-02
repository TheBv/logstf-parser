import * as events from "./interfaces/events";
import GameStateModule from "./modules/GameStateModule";
import { Game, IGameState } from "./Game";

type GameModule = { new(gameState: IGameState): events.IStats };

export class LogParser {
  private _modules: Set<GameModule> = new Set();
  private useCustom: boolean;
  private useSteam64: boolean;
  private applyDamageHealing: boolean;
  constructor() {
    this.useCustom = false;
    this.useSteam64 = false;
    this.applyDamageHealing = false;
  }

  useCustomGameState() {
    this.useCustom = true;
  }

  useSteam64Id() {
    this.useSteam64 = true;
  }

  useDamageHealing() {
    this.applyDamageHealing = true;
  }

  parseLines(lines: string[]): Game {
    const game = new Game(this.useSteam64, this.applyDamageHealing);

    if (!this.useCustom) {
      game.modules.push(new GameStateModule(game.gameState));
    }

    for (const module of this._modules) {
      game.modules.push(new module(game.gameState));
    }

    lines.forEach((line) => game.processLine(line));
    game.finish();

    return game;
  }

  addModule(moduleClass: GameModule) {
    this._modules.add(moduleClass);
  }

  get modules(): GameModule[] {
    return [...this._modules.keys()];
  }
}

// Export interfaces
export * as events from "./interfaces/events";
export * from "./modules/ModuleHolder";
export { IGameState, PlayerInfo } from "./Game";
