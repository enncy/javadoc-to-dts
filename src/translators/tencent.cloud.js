// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher

const tencentcloud = require("tencentcloud-sdk-nodejs-tmt");
const { Translator } = require("../utils");
require("dotenv").config();

const TmtClient = tencentcloud.tmt.v20180321.Client;


/**
 *  腾讯云翻译器
 *  实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
    代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
    密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
 */
class TencentCloudTranslator extends Translator {
    constructor(config = { secretId: '', secretKey: '', region: '', target: 'zh', source: 'en', projectId: 0 }) {
        super();
        this.clientConfig = {
            credential: {
                secretId: config.secretId,
                secretKey: config.secretKey,
            },
            region: config.region,
            profile: {
                httpProfile: {
                    endpoint: "tmt.tencentcloudapi.com",
                },
            },
        };
        this.config = config;
        this.client = new TmtClient(this.clientConfig);
    }

    /**
     * 
     * @param {string} text translate source text  
     * @returns 
     */
    translate(text = '') {
        return new Promise((resolve, reject) => {
            const params = {
                "SourceText": text,
                "Source": this.config.source,
                "Target": this.config.target || 'zh',
                "ProjectId": this.config.projectId || 0,
            };
            this.client.TextTranslate(params).then(
                (data) => {
                    /**
                     * {
                            "Response": {
                                "RequestId": "xxx",
                                "Source": "en",
                                "Target": "zh",
                                "TargetText": "xxx",
                                "UsedAmount": 111
                            }
                        }
                     */
                    resolve(data.TargetText);
                },
                (err) => {
                    console.error("error", err);
                    reject(err);
                }
            );
        });
    }
}


exports.TencentCloudTranslator = TencentCloudTranslator