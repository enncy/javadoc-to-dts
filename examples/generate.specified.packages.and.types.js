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

    await generator.generatePackages(docs_index_url, output_path)
}

