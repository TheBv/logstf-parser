export interface LooseObject {
    [key: string]: any
}

export function renameObjectKeys<T extends LooseObject, V extends LooseObject>(object: V, transformMap: Map<keyof V, keyof T>): T {
    const replacement = {} as T;

    for (const key of transformMap.keys()) {
        const value = object[key] as any;
        //delete object[key];
        if (value !== undefined) {
            replacement[transformMap.get(key)!] = value;
        }
    }
    return replacement as T;
}
