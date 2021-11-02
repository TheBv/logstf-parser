const axios = require('axios');
const JSZip = require('jszip');
const parserCJS = require("../../lib/cjs/LogParser");

const LogParserCJS = new parserCJS.LogParser();
for (const module of Object.values(parserCJS.defaultModules)){
    LogParserCJS.addModule(module);
}

async function runBenchmark(amount) {
    const logs = []
    for (let i= 3025949; i > 3025949 - amount; i--){
        const log = await fetchLog(i)
        logs.push(log);
    }
    const start = performance.now()
    for (let i = 0; i < 10; i++){
        for (const log of logs){
            LogParserCJS.parseLines(log);
        }
    }
    const end = performance.now()
    return ((end-start)/10);
}

async function fetchLog(logid){
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

  runBenchmark(30).then(res => console.log(res));