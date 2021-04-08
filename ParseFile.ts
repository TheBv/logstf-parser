const start_time = new Date().getTime();

import program = require('commander')
import fs = require('fs')
import { LogParser } from './LogParser'

function parseFile(path: string) {
    const lines = fs.readFileSync(path, "UTF-8").split("\n");
    const logParser = new LogParser()
    return logParser.parseLines(lines)
}

program
  .usage("[options] [file]")
  .parse(process.argv);

const log_path = program.args.join(' ');
const game = parseFile(log_path);
const end_time = new Date().getTime();
const process_time = (end_time - start_time) / 1000;
console.log(game);