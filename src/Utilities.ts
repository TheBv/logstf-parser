export interface LooseObject {
    [key: string]: any
}

export function renameObjectKeys(object: LooseObject, transformMap: Map<string, any>): LooseObject {
    const replacement: LooseObject = {};

    for (const key of transformMap.keys()) {
        const value = object[key];
        //delete object[key];
        if (value !== undefined)
            replacement[transformMap.get(key)] = value;
    }
    return replacement;
}
