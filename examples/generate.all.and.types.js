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
        fs.appendFileSync(types_path, '\n' + results.map(r => {
            const classname = `${pack_name}.${r.type_name.replace(/_/g, '.').split('<')[0]}`
 
            if (r.modifiers.includes('enum')) {
                const name = r.type_name.replace(/<.*>/g, '')
                return `exports.${name} = /** @type {${name}Enum} */ (${classname})`
            }
            else if (r.modifiers.includes('class')) {
                const name = r.type_name.replace(/<.*>/g, '')
                return `exports.${name} =  /** @type {${name}Constructor} */ (${classname}  )`
            }
        }).filter(Boolean).join('\n'));
    }
})

if (fs.existsSync(types_path)) {
    fs.unlinkSync(types_path)
}
fs.appendFileSync(types_path, `/// <reference types="./${path.basename(types_path.replace(/\.types\.js/, '.d.ts'))}" />\n`)

generator.generatePackages(docs_index_url, output_path)