const { Generator, TencentCloudTranslator } = require("../index");

const path = require('path');

const docs_index_url = 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/module-summary.html'
const output_path = path.resolve('./output-test')

const generator = new Generator({
    translator: new TencentCloudTranslator({
        secretId: process.env.SECRET_ID || '',
        secretKey: process.env.SECRET_KEY || '',
        region: process.env.REGION || '',
        projectId: parseInt(process.env.PROJECT_ID || '0') || 0,
        target: 'zh',
        source: 'en',
        // TencentCloud limit: 5 request per second 
        translate_period: 200
    }),
})

generator.generatePackages(docs_index_url, output_path)