/**
 *  腾讯云翻译器
 *  实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
    代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
    密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
 */
export class TencentCloudTranslator extends Translator {
    constructor(config?: {
        secretId: string;
        secretKey: string;
        region: string;
        target: string;
        source: string;
        projectId: number;
    });
    clientConfig: {
        credential: {
            secretId: string;
            secretKey: string;
        };
        region: string;
        profile: {
            httpProfile: {
                endpoint: string;
            };
        };
    };
    config: {
        secretId: string;
        secretKey: string;
        region: string;
        target: string;
        source: string;
        projectId: number;
    };
    client: import("tencentcloud-sdk-nodejs-tmt/tencentcloud/services/tmt/v20180321/tmt_client").Client;
    /**
     *
     * @param {string} text translate source text
     * @returns
     */
    translate(text?: string): Promise<any>;
}
import { Translator } from "../utils";
