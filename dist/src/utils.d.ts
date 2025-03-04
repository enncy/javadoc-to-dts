export function sleep(ms?: number): Promise<any>;
export function createTopBanner(doc_index_url?: string): string;
export function createPackageBanner(name?: string, url?: string): string;
export function httpGet(url: string, time_out?: number, retry?: number): Promise<string>;
export function parseHtml(url?: string): Promise<Document>;
export class Translator {
    constructor(output_path?: string, translate_period?: number);
    /** @type {{():void}[]} */
    tasks: {
        (): void;
    }[];
    output_path: string;
    translate_period: number;
    start(): void;
    start_translate_task: boolean | undefined;
    stop(): void;
    loop(): Promise<void>;
    /**
     * add a translate task to the queue, and will be executed in order
     * @param {string} text
     * @param callback  callback when translated
     */
    addTask(text?: string, callback?: (id?: string, translated?: string) => void): string;
    /**
     *
     * @returns {string | Promise<string>}
     */
    translate(text?: string): string | Promise<string>;
}
