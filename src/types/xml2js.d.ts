declare module 'xml2js' {
    export class Parser {
        constructor(options?: ParserOptions);
        parseStringPromise(str: string): Promise<any>;
        parseString(str: string, callback: (err: Error, result: any) => void): void;
    }

    export interface ParserOptions {
        explicitArray?: boolean;
        ignoreAttrs?: boolean;
        mergeAttrs?: boolean;
        explicitRoot?: boolean;
        explicitCharkey?: boolean;
        trim?: boolean;
        normalizeTags?: boolean;
        normalize?: boolean;
        attrkey?: string;
        charkey?: string;
        rootName?: string;
        xmldec?: { version: '1.0'; encoding: 'UTF-8'; standalone: boolean };
        doctype?: any;
        renderOpts?: { pretty: boolean; indent: string; newline: string };
        headless?: boolean;
        chunkSize?: number;
        emptyTag?: any;
        strict?: boolean;
        attrNameProcessors?: Array<(name: string) => any>;
        attrValueProcessors?: Array<(value: string, name: string) => any>;
        tagNameProcessors?: Array<(name: string) => any>;
        valueProcessors?: Array<(value: string, name: string) => any>;
    }
}