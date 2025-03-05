const { Generator } = require("../index");
const path = require('path');

const docs_index_url = 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/module-summary.html'
const output_path = path.resolve('./output-test')

const generator = new Generator()

generator.generatePackages(docs_index_url, output_path)