export class Generator {
    /**
     * generate all typescript definition from java docs page
     * @param {string} doc_index_url
     * @param {GenerateOptions} options
     */
    constructor(doc_index_url: string, options: GenerateOptions);
    doc_index_url: string;
    options: GenerateOptions;
    translator: Translator;
    start(): Promise<void>;
    /**
     * @param {string} doc_index_url
     * @param {Document} document
     * @returns
     */
    getAllPackages(doc_index_url: string, document: Document): {
        name: string;
        url: string;
    }[];
    /**
     * @param {Document} document
     * @param {Element} enum_constant_summary_root
     * @returns
     */
    generateEnum(document: Document, enum_constant_summary_root: Element): string;
    /**
     *
     * @param {Document} document
     * @returns
     */
    generateInterface(document: Document): string;
    /**
     * get fields
     * @param {Document} document
     * @param {(details: FieldDetails )=>boolean} filter
     */
    getFields(document: Document, filter?: (details: FieldDetails) => boolean): string[];
    /**
     * get constructor
     * @param {Document} document
     */
    getConstructor(document: Document, type_desc?: string, type_name?: string): {
        template: string;
        comments: string | Promise<string>;
    };
    /**
     * get methods
     * @param {Document} document
     * @param {(details: MethodDetails )=>boolean} filter
     */
    getMethods(document: Document, filter?: (details: MethodDetails) => boolean): string[];
    /**
     * get type infos such as class/interface/enum
     * @param {Document} document
     */
    getTypeInfo(document: Document): {
        type_name: string;
        type_desc: string;
        extends_str: string;
        modifiers: string;
    };
    getFieldDetails(field_str?: string): {
        type: string;
        modifiers: string;
        annotations: string[];
    };
    /**
     * @param {Document} document
     * @param {number} index
     * @returns {ConstructorDetails | undefined}
     */
    getConstructorDetails(document: Document, index: number): ConstructorDetails | undefined;
    /**
     * @param {Document} document
     * @param {string} method_str
     * @returns {MethodDetails | undefined}
     */
    getMethodDetails(document: Document, method_str?: string): MethodDetails | undefined;
    /**
     *
     * @param {string} method_params_str
     * @param {Record<string, string[]>} notes
     * @returns {Param[]}
     */
    resolveParams(method_params_str?: string, notes?: Record<string, string[]>): Param[];
}
import { Translator } from "./utils";
