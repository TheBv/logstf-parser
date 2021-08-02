import * as parser from "../LogParser";

describe('logs-parser', () => {
    let logsParser: parser.LogParser;

    beforeAll(() => {
        const testingParser = new parser.LogParser();
        for (const module of Object.values(parser.defaultModules)){
            testingParser.addModule(module);
        }

        logsParser = testingParser;
    });
    
    it('can load', () => {
        expect(logsParser).toBeDefined();
    })

    
})