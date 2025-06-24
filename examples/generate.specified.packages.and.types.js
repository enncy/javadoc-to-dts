const { Generator } = require("../index");
const path = require('path');
const fs = require('fs');

const package_names = ['java.io', 'java.lang', 'java.net', 'java.nio', 'java.time', 'java.util', 'java.util']
const docs_index_url = 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/module-summary.html'
const output_path = path.resolve('./output-test');


; (async () => {
    for (const name of package_names) {
        await generateSpecifiedPackage(docs_index_url, name)
    }
})()


async function generateSpecifiedPackage(docs_index_url = '', specified_package_name = '') {
    const types_path = path.resolve(`./output-test/${specified_package_name}.types.js`)

    const generator = new Generator({
        onPackGenerateStart(pack) {
            if (pack.startsWith(specified_package_name)) {
                return true
            }
            return false
        },
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


    await generator.generatePackages(docs_index_url, output_path)
}

