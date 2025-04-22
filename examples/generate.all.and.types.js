const { Generator } = require("../index");
const path = require('path');
const fs = require('fs');

const docs_index_url = 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/module-summary.html'
const output_path = path.resolve('./output-test')
/**
 * a file to generate all types and export them
 * useful for https://github.com/oracle/graaljs
 */
const types_path = path.resolve(`./output-test/all.types.js`)

const generator = new Generator({
    onPackGenerateFinish(pack_name, pack_url, results) {
        fs.appendFileSync(types_path, `/// <reference types="./${path.basename(types_path.replace(/\.types\.js/, '.d.ts'))}" />\n`)

        fs.appendFileSync(types_path, '\n' + results.map(r => {
            if (r.modifiers.includes('enum')) {
                const name = r.type_name.replace(/<.*>/g, '')
                return `\n/** @type {${name}Enum} */\nexports.${name} = Java.type("${pack_name}.${r.type_name.replace(/_/g, '.')}")`
            }
            else if (r.modifiers.includes('class')) {
                const name = r.type_name.replace(/<.*>/g, '')
                return `\n/** @type {${name}Constructor} */\nexports.${name} = Java.type("${pack_name}.${r.type_name.replace(/_/g, '.')}")`
            }
        }).filter(Boolean).join('\n'));
    }
})

if (fs.existsSync(types_path)) {
    fs.unlinkSync(types_path)
}

generator.generatePackages(docs_index_url, output_path)