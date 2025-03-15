export * from './dist/index';

export { }

declare global {

    export interface JavaObject {
        toString(): string;
        equals(obj: any): boolean;
    }

    export interface TypeInfo {
        type_desc: string,
        type_name: string,
        extends_str: string,
        modifiers: string,
    }


    export interface FieldDetails {
        type: string,
        modifiers: string,
        annotations: string[];
    }

    export interface Param {
        name: string;
        type: string;
        annotations: string[];
        desc: string;
    }

    export interface MethodDetails {
        modifiers: string,
        method_name: string,
        return_type: string,
        annotations: string[],
        deprecation_comment: string,
        method_comment: string,
        params: Param[],
        return_type_comments: string[],
        throws_comments: string[],
        type_parameters: string
    }

    export interface ConstructorDetails {
        deprecation_comment: string,
        method_comment: string,
        params: Param[],
    }

    export interface GenerateOptions {
        generate_banner?: boolean,
        translator?: Translator
        onTypeGenerateStart?: (info: TypeInfo) => boolean,
        onTypeGenerateFinish?: (info: TypeInfo, template: string) => boolean,
        onTypeHandle?: (info: TypeInfo) => void,
        onPramHandle?: (info: Param) => void,
        onConstructorHandle?: (details: ConstructorDetails) => void,
        onMethodHandle?: (details: MethodDetails) => void,
        onPackGenerateStart?: (pack_name: string, pack_url: string) => boolean | void,
        onPackGenerateFinish?: (pack_name: string, pack_url: string, type_infos: TypeInfo[]) => void,
    }
}