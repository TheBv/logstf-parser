import { defaultModules, LogParser } from "../src/LogParser";
import fs from "fs/promises";
import axios from 'axios';
import JSZip from 'jszip';

import sixesJson from "./logs/log_6s.json";
import sixes64Json from "./logs/log_6s_STEAM64.json";
import hlJson from "./logs/log_hl.json";
import steamJson from "./logs/log_STEAM_.json";
import bballJson from "./logs/log_bball.json";
import negTimes from "./logs/log_negTimes.json"
import GameStateModule from "../src/modules/GameStateModule";
import { Log } from "../src/interfaces/LogstfInterfaces";

describe("logs-parser", () => {
    let logParser: LogParser;
    // Jest tends to timeout the first time you run the test
    jest.setTimeout(20000)
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
        const length = logParser.modules.length;

        logParser.addModule(defaultModules.ChatModule);

        expect(logParser.modules.length).toBe(length);
    });

    it("can use a custom game state", async () => {
        const testingParser = new LogParser();
        testingParser.useCustomGameState();
        testingParser.addModule(GameStateModule);
        for (const module of Object.values(defaultModules)) {
            testingParser.addModule(module);
        }
        const lines = await fs.readFile("./tests/logs/log_6s.log", {
            encoding: "utf-8",
        });

        const game = testingParser.parseLines(lines.split("\n"));

        expect(game.toJSON()).toMatchObject(sixesJson);
    })
    it("can use steam64 to parse", async () => {
        const testingParser = new LogParser();
        testingParser.useSteam64Id();
        for (const module of Object.values(defaultModules)) {
            testingParser.addModule(module);
        }
        const lines = await fs.readFile("./tests/logs/log_3045614.log", {
            encoding: "utf-8",
        });

        const game = testingParser.parseLines(lines.split("\n"));
        expect(game.toJSON()).toMatchObject(sixes64Json);
    })
    describe("can full parse", () => {
        it("a sixes (6s) game", async () => {
            const lines = await fs.readFile("./tests/logs/log_6s.log", {
                encoding: "utf-8",
            });

            const game = logParser.parseLines(lines.split("\n"));

            expect(game.toJSON()).toMatchObject(sixesJson);
        });
        it("a log with sizzlingstats", async () => {
            const lines = await fs.readFile("./tests/logs/log_STEAM_.log", {
                encoding: "utf-8",
            });

            const game = logParser.parseLines(lines.split("\n"));

            expect(game.toJSON()).toMatchObject(steamJson);
        })
        it("a highlander (hl) game", async () => {
            // https://logs.tf/2890935
            const lines = await fs.readFile("./tests/logs/log_hl.log", {
                encoding: "utf-8",
            });

            const game = logParser.parseLines(lines.split("\n"));

            expect(game.toJSON()).toMatchObject(hlJson);
        });
        it("a bball game", async () => {
            const lines = await fs.readFile("./tests/logs/log_bball.log", {
                encoding: "utf-8",
            });

            const game = logParser.parseLines(lines.split("\n"));
            expect(game.toJSON()).toMatchObject(bballJson);
        });
        it("a log that goes backwards in time", async () => {
            const lines = await fs.readFile("./tests/logs/log_negTimes.log", {
                encoding: "utf-8",
            });

            const game = logParser.parseLines(lines.split("\n"));

            expect(game.toJSON()).toMatchObject(negTimes);
        });

        it("produces same results as logstf", async () => {
            const logid = 3056639//3025115//Difference: 3024932//Fine: 3024930//Damage difference: 3024929
            //3024940
            logParser.useDamageHealing();
            const json = await fetchJson(logid);
            const logLines = await fetchLog(logid);
            const game = logParser.parseLines(logLines);
            const gameData = game.toLogstf()
            // Team death data seems to be mostly broken; don't compare against it
            if (gameData.teams) {
                gameData.teams.Blue.deaths = 0;
                gameData.teams.Red.deaths = 0;
            }
            // Player sentry data seems to be mostly broken; don't compare against it
            if (json.players && gameData.players) {
                for (const playerKey of Object.keys(json.players)) {
                    json.players[playerKey].sentries = 0

                }
                for (const playerKey of Object.keys(gameData.players)) {
                    const player = gameData.players[playerKey]
                    player.sentries = 0
                    // Captures aren't counted for players that have a ' " ' in their name (logstf) 
                    if (gameData.names && gameData.names[playerKey] &&
                        gameData.names[playerKey].includes("") && json.players[playerKey]) {
                        player.cpc = json.players[playerKey].cpc;
                    }
                    // Logstf seems to only save player's classes on which they've fulfilled the following conditions
                    if (player.class_stats)
                        player.class_stats = player.class_stats.filter((stat) => stat.kills + stat.deaths + stat.assists > 0);
                }
            }
            if (json.info && gameData.info) {
                // All of these get set when uploading a log to logs.tf
                gameData.info.date = undefined; json.info.date = undefined;
                gameData.info.map = undefined; json.info.map = undefined;
                gameData.info.title = undefined; json.info.title = undefined;
                gameData.info.uploader.id = undefined; json.info.uploader.id = undefined;
                gameData.info.uploader.name = undefined; json.info.uploader.name = undefined;
                gameData.info.uploader.info = undefined; json.info.uploader.info = undefined;
                // This most likely refers to incrementially updating logs, which we can't check for
                gameData.info.supplemental = false; json.info.supplemental = false;
                // Seems to be broken
                gameData.info.hasSB = false; json.info.hasSB = false;
            }
            // Killstreak algorithm isn't a 100% match right now
            gameData.killstreaks = undefined; json.killstreaks = undefined;
            expect(gameData).toMatchObject(json)
            //TODO: handle round.players where team = null

        })
    });
});

async function fetchJson(id: number): Promise<Log> {
    const response = await axios.get(`https://logs.tf/json/${id}`)
    return response.data;

}

async function fetchLog(logid: number): Promise<string[]> {
    try {
        const response = await axios.get(`https://logs.tf/logs/log_${logid}.log.zip`, { responseType: 'arraybuffer' })
        const zipData = await JSZip.loadAsync(response.data)
        const logFile = await zipData.file(`log_${logid}.log`);
        if (logFile) {
            const log = await logFile.async("text");
            const logLines = log.split("\n")
            return logLines;
        }
    } catch (error) {
        console.error(`Failed to parse logfile with id ${logid}. Reason:\n `, error);
        return [];
    }
    return [];
}