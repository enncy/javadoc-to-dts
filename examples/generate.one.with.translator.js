const { Generator, TencentCloudTranslator } = require("../index");

const translator = new TencentCloudTranslator({
    secretId: process.env.SECRET_ID || '',
    secretKey: process.env.SECRET_KEY || '',
    region: process.env.REGION || '',
    projectId: parseInt(process.env.PROJECT_ID || '0') || 0,
    target: 'zh',
    source: 'en',
    // TencentCloud limit: 5 request per second 
    translate_period: 200
})

const generator = new Generator({ translator })

generator.generateType('https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Map.html')
    .then((res) => {
        translator.translateAllMarked(res?.template || '', { period: 200 }).then((result) => {
            console.log(result);
        })
    })

