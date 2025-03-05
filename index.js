const { config } = require("./config");
const { Generator } = require("./src/core");
const { TencentCloudTranslator } = require("./src/translators/tencent.cloud");
const { parseHtml, Translator, httpGet } = require("./src/utils");


exports.Generator = Generator;
exports.parseHtml = parseHtml
exports.Translator = Translator
exports.TencentCloudTranslator = TencentCloudTranslator
exports.httpGet = httpGet
exports.config = config