# javadoc-to-dts

> generate typescript definitions file from javadoc
> useful for https://github.com/oracle/graaljs

## Install

```bash
npm install javadoc-to-dts
```

## Usage

```js
const { Generator } = require("javadoc-to-dts");
const path = require("path");

const docs_index_url =
  "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/module-summary.html";
const output_path = path.resolve("./output-test");

const generator = new Generator();

generator.generatePackages(docs_index_url, output_path);
```

## Api

- `Generator` : Generator class, use to generate typescript definitions file from javadoc

- `generator.generatePackages` : generate all packages from docs index url, url should be like  https://docs.oracle.com/en/java/javase/21/docs/api/java.base/module-summary.html ,

- `generator.generateType` : generate single type from type doc url,  url should be like  https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html ,

## Config

change config if you need, witch is export from `config.js`

```js
const { config } = require("javadoc-to-dts");
// example ['wait', 'notify', 'notifyAll']
// defaults: []
config.ignores_methods = [
  /** ... */
];
// example  ["int-number",  "String-string"]
// defaults: see `config.js`
config.types_mapping = [
  /** ... */
];
```

## Translator

> only support [`TencentCloudTranslator`](https://console.cloud.tencent.com/tmt) now

create `.env` file in root folder

see [`TencentCloudTranslator`](https://console.cloud.tencent.com/tmt) Api for more details

```env
SECRET_ID=xxx
SECRET_KEY=xxx
REGION=ap-xxx
PROJECT_ID=0
```

use TencentCloudTranslator

```js
const { Generator, TencentCloudTranslator } = require("javadoc-to-dts");
const translator = new TencentCloudTranslator({
  secretId: process.env.SECRET_ID || "",
  secretKey: process.env.SECRET_KEY || "",
  region: process.env.REGION || "",
  projectId: parseInt(process.env.PROJECT_ID || "0") || 0,
  target: "zh",
  source: "en",
  // TencentCloud limit: 5 request per second
  translate_period: 200,
});

const generator = new Generator({
  translator,
});

// ... generate
```

### Custom translator

> implement your own translator

```js

const { Generator, Translator } = require('javadoc-to-dts')
class CustomTranslator extends Translator {
    async translate(text = '') {
        const translated = ''
        // ...your logic
        return translated
    }
}

const generator = new Generator({
    translator: new CustomTranslator()
})

```

## Use With [`graaljs`](https://github.com/oracle/graaljs)

> graaljs is a javascript engine based on graalvm

see /examples/generate.all.and.types.js

## Examples

more examples see /examples folder
