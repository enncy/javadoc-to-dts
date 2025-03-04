const { Generator } = require("./src/core");
const { parseHtml, Translator, httpGet } = require("./src/utils");


exports.Generator = Generator;
exports.parseHtml = parseHtml
exports.Translator = Translator
exports.httpGet = httpGet