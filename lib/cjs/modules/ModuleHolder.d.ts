import ChatModule from './ChatModule';
import GameStateModule from './GameStateModule';
import HealSpreadModule from './HealSpreadModule';
import KillstreakModule from './KillstreakModule';
import PlayerClassStatsModule from './PlayerClassStatsModule';
import PlayerStatsModule from './PlayerStatsModule';
import PvCModule from './PvCModule';
import PvPModule from './PvPModule';
import RealDamageModule from './RealDamageModule';
import TeamStatsModule from './TeamStatsModule';
declare const defaultModules: {
    ChatModule: typeof ChatModule;
    GameStateModule: typeof GameStateModule;
    HealSpreadModule: typeof HealSpreadModule;
    KillstreakModule: typeof KillstreakModule;
    PlayerClassStatsModule: typeof PlayerClassStatsModule;
    PlayerStatsModule: typeof PlayerStatsModule;
    PvCModule: typeof PvCModule;
    PvPModule: typeof PvPModule;
    RealDamageModule: typeof RealDamageModule;
    TeamStatsModule: typeof TeamStatsModule;
};
export { defaultModules };