import { defaultModules, LogParser } from "../LogParser";
import fs from "fs/promises";
import axios from 'axios';
import JSZip from 'jszip';

import sixesJson from "../logs/log_6s.json";
import sixes64Json from "../logs/log_6s_STEAM64.json";
import hlJson from "../logs/log_hl.json";
import steamJson from "../logs/log_STEAM_.json";
import bballJson from "../logs/log_bball.json";
import GameStateModule from "../modules/GameStateModule";

describe("logs-parser", () => {
  let logParser: LogParser;

  beforeAll(() => {
    const testingParser = new LogParser();

    for (const module of Object.values(defaultModules)) {
      testingParser.addModule(module);
    }

    logParser = testingParser;
  });

  it("can load", () => {
    expect(logParser).toBeDefined();
  });

  it("will not duplicate modules", () => {
    expect(logParser.modules.length).toBe(10);

    logParser.addModule(defaultModules.ChatModule);

    expect(logParser.modules.length).toBe(10);
  });

  it("can use a custom game state",async ()=> {
    const testingParser = new LogParser();
    testingParser.useCustomGameState();
    testingParser.addModule(GameStateModule);
    for (const module of Object.values(defaultModules)) {
      testingParser.addModule(module);
    }
    const lines = await fs.readFile("./logs/log_6s.log", {
      encoding: "utf-8",
    });

    const game = testingParser.parseLines(lines.split("\n"));

    expect(game.toJSON()).toMatchObject(sixesJson);
  })
  it ("can use steam64 to parse",async ()=> {
    const testingParser = new LogParser();
    testingParser.useSteam64Id();
    for (const module of Object.values(defaultModules)) {
      testingParser.addModule(module);
    }
    const lines = await fs.readFile("./logs/log_6s.log", {
      encoding: "utf-8",
    });

    const game = testingParser.parseLines(lines.split("\n"));
    console.log(game.toJSON());
    expect(game.toJSON()).toMatchObject(sixes64Json);
  })
  describe("can full parse", () => {
    it("a sixes (6s) game", async () => {
      const lines = await fs.readFile("./logs/log_6s.log", {
        encoding: "utf-8",
      });

      const game = logParser.parseLines(lines.split("\n"));

      expect(game.toJSON()).toMatchObject(sixesJson);
    });
    it ("a log with sizzlingstats", async () => {
      const lines = await fs.readFile("./logs/log_STEAM_.log", {
        encoding: "utf-8",
      });

      const game = logParser.parseLines(lines.split("\n"));

      expect(game.toJSON()).toMatchObject(steamJson);
    })
    it("a highlander (hl) game", async () => {
      // https://logs.tf/2890935
      const lines = await fs.readFile("./logs/log_hl.log", {
        encoding: "utf-8",
      });

      const game = logParser.parseLines(lines.split("\n"));

      expect(game.toJSON()).toMatchObject(hlJson);
    });

    it("a bball game", async () => {
      const lines = await fs.readFile("./logs/log_bball.log", {
        encoding: "utf-8",
      });

      const game = logParser.parseLines(lines.split("\n"));
      expect(game.toJSON()).toMatchObject(bballJson);
    });
    /*
    it("produces same results as logstf",async ()=>{
      const logid = 3024929
      const json = await fetchJson(logid);
      const game = logParser.parseLines(await fetchLog(logid));
      const gameData = game.toJSON()
      const test = /<(?<!STEAM_)(.{1,20})/
      const compareObject = {
        chat: gameData.chat,
        classdeaths: convertPvC(gameData.PvC,"deaths"),
        classkillassists: convertPvC(gameData.PvC,"assists"),
        classkills: convertPvC(gameData.PvC,"kills"),
        healspread: gameData.healspread,
        killstreaks: gameData.killstreaks,
        length: gameData.game.totalLength,
        rounds: gameData.game.rounds,
        names: gameData.playernames //TODO: teams and players
        //teams: gameData.teams.map((team : any)=> {team.dmg = team.damage; return team;})
        //players: 
      }
      //TODO: delete info, version
      delete json.info; delete json.version; delete json.success; delete json.teams; delete json.players; delete json.names;
      expect(json).toMatchObject(compareObject);
      //Proper logic
     })*/
  });
});

function convertPvC(PvC: Map<string, any> , valueName: string){
  interface LooseObject {
    [key: string]: any
  }
  const classStats: LooseObject = {} 
  PvC.forEach((value: any,key : string)=>{
    const playerStats: LooseObject = {}
    value.forEach((value: any ,key: any)=>{
      if (value[valueName])
        playerStats[key] = value[valueName]
    })
    if (!(Object.keys(playerStats).length === 0))
      classStats[key] = playerStats;
  })
  return classStats;
}

async function fetchJson(id: number) : Promise<any>{
  const response = await axios.get(`https://logs.tf/json/${id}`)
  return response.data;

}
async function fetchLog(logid: number) : Promise<string[]>{
  try {
      const response = await axios.get(`https://logs.tf/logs/log_${logid}.log.zip`,{responseType:'arraybuffer'})
      const zipData = await JSZip.loadAsync(response.data)
      const logFile = await zipData.file(`log_${logid}.log`);
      if (logFile){
          const log = await logFile.async("text");
          const logLines = log.split("\n")
          return logLines;
      }
  } catch (error){
      console.error(`Failed to parse logfile with id ${logid}. Reason:\n `,error);
      return [];
  }
  return [];
}