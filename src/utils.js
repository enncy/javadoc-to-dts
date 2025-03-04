

const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { config } = require('../config');
const { randomUUID } = require('crypto');


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
    return Promise.race([
        new Promise((resolve, reject) => {
            setTimeout(() => reject('timeout'), time_out)
        }),
        new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http
            protocol.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => { 
                    data += chunk;
                });
                res.on('end', () => {
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


class Translator {

    constructor(output_path = '', translate_period = 1000) {
        /** @type {{():void}[]} */
        this.tasks = []
        this.output_path = output_path
        this.translate_period = translate_period
    }

    start() {
        this.start_translate_task = true
        this.loop()
    }

    stop() { }

    async loop() {
        if (this.start_translate_task === false) {
            return
        }
        try {
            if (this.tasks.length > 0) {
                const task = this.tasks.shift()
                if (task) {
                    await task()
                }
            }
        } catch (e) {
            console.error(e)
        }
        await exports.sleep(this.translate_period)
        await this.loop()
    }

    /**
     * add a translate task to the queue, and will be executed in order
     * @param {string} text 
     * @param callback  callback when translated
     */
    addTask(text = '', callback = (id = '', translated = '') => {
        const content = fs.readFileSync(path.resolve(this.output_path), 'utf-8')
        fs.writeFileSync(path.resolve(this.output_path), content.replace(new RegExp(id, 'g'), translated))
    }) {
        if (text.trim().length === 0) {
            return ''
        }
        const id = `[Translate_${randomUUID()}]`
        this.tasks.push(async () => {
            try {
                const translated = await this.translate(text)
                callback(id, translated)
            } catch (e) {
                console.error(e)
            }
        })
        return id
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