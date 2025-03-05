

const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { JSDOM } = require('jsdom')
const { randomUUID } = require('crypto');
const chalk = require('chalk');
const ora = require('ora');


exports.sleep = (ms = 0) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.createTopBanner = (doc_index_url = '') => {
    return `\n/**
${'='.repeat(100)} 
powered by https://github.com/enncy/javadoc-to-dts
generated from ${doc_index_url}
generated at ${new Date().toLocaleString()}
${'='.repeat(100)}
*/`
}

exports.createPackageBanner = (name = '', url = '') => {
    return `\n/**
${'='.repeat(100)}
package ${name}
generated from ${url}
${'='.repeat(100)}
*/`
}



/**
 * get content from url
 * @param {string} url 
 * @returns {Promise<string>}
 */
exports.httpGet = (url, time_out = 30 * 1000, retry = 3) => {
    if (!url) {
        return Promise.reject('url is required')
    }
    /** @type {any} */
    let timeout = undefined;
    return Promise.race([
        new Promise((resolve, reject) => {
            timeout = setTimeout(() => reject('timeout'), time_out)
        }),
        new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http
            protocol.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    timeout && clearTimeout(timeout)
                    resolve(data);
                });
            }).on('error', (e) => {
                reject(e);
            });
        })
    ]).catch(async (e) => {
        if (retry > 0) {
            await exports.sleep(1000)
            console.log(`retrying ${url}...`);
            return exports.httpGet(url, time_out, retry - 1)
        }
        return Promise.reject(e)
    })
}

/**
 * parse url to document
 */
exports.parseHtml = (url = '') => {
    return exports.httpGet(url).then((content) => {
        return new JSDOM(content).window.document
    })
}

class Translator { 
    constructor(translate_period = 100) {
        this.marks = Object.create({})
        this.translate_period = translate_period
        this.spinner = ora('') 
    }

    mark(text = '') {
        const uid = `[${randomUUID().replace(/-/g, '')}]`
        this.marks[uid] = text
        return uid
    }

    async translateAllMarked(content = '', options = { period: 0 }) {
        const marks = Object.entries(this.marks)
        this.spinner.start(chalk.blueBright(`translating ${marks.length} marked text...`)) 
        let i = 0;
        for (const [uid, text] of Object.entries(this.marks)) { 
            content = content.replace(uid, await this.translate(text))
            await exports.sleep(options.period ?? this.translate_period ?? 0)
            i++;
            this.spinner && (this.spinner.text = chalk.blueBright(`translating ${i}/${marks.length} marked text...`))
        }
        this.spinner.succeed(chalk.greenBright(`translated ${marks.length} marked text`))
        return content
    }

    /**
     *  
     * @returns {string | Promise<string>}
     */
    translate(text = '') {
        return text
    }
}


exports.Translator = Translator