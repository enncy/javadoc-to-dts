export { }
import { Translator } from './utils';


declare global {
    interface TypeInfo {
        type_desc: string,
        type_name: string,
        extends_str: string,
        modifiers: string,
    }


    interface FieldDetails {
        type: string,
        modifiers: string,
        annotations: string[];
    }

    interface Param {
        name: string;
        type: string;
        annotations: string[];
        desc: string;
    }

    interface MethodDetails {
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

    interface ConstructorDetails {
        deprecation_comment: string,
        method_comment: string,
        params: Param[],
    }

    interface GenerateOptions { 
        generate_banner?: boolean,
        translator?: Translator
        onTypeGenerateStart?: (info: TypeInfo ) => boolean,
        onTypeGenerateFinish?: (info: TypeInfo, template: string) => boolean,
        onTypeHandle?: (info: TypeInfo) => void,
        onFieldHandle?: (info: FieldInfo) => void,
        onPramHandle?: (info: Param) => void,
        onConstructorHandle?: (details: ConstructorDetails) => void,
        onMethodHandle?: (details: MethodDetails) => void,
        onPackGenerateStart?: (pack_name: string, pack_url: string ) => boolean | void,
        onPackGenerateFinish?: (pack_name: string, pack_url: string, type_infos: TypeInfo[]) =>   void,
    }
}


