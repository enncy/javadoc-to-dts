// @ts-check
/**
 * generate typescript interfaces from java docs
 */


const jsdom = require('jsdom');
const path = require('path');
const fs = require('fs');

const { config } = require('../config');
const { createTopBanner, createPackageBanner, httpGet, Translator } = require('./utils');

const java_defaults_modifiers = ['public', 'protected', 'private', 'static', 'final', 'abstract', 'synchronized', 'volatile', 'transient', 'native', 'strictfp', 'default']
const param_name_regexp = /^[0-9a-zA-Z\._]+/

class Generator {
    /**
     * generate all typescript definition from java docs page
     * @param {string} doc_index_url 
     * @param {GenerateOptions} options  
     */
    constructor(doc_index_url, options) {
        this.doc_index_url = doc_index_url
        this.options = options
        this.translator = options.translator || new Translator()
    }

    async start() {
        this.translator.start()

        const { doc_index_url, options } = this

        const content = await httpGet(doc_index_url);

        const dom = new jsdom.JSDOM(content);
        const document = dom.window.document;

        const packages = this.getAllPackages(doc_index_url, document)
        if (packages.length === 0) {
            console.error('no packages found !')
            return
        }

        if (fs.existsSync(path.resolve(options.output_path))) {
            fs.unlinkSync(path.resolve(options.output_path))
        } else {
            fs.mkdirSync(path.dirname(path.resolve(options.output_path)), { recursive: true })
        }


        options.generate_banner && fs.appendFileSync(path.resolve(options.output_path), createTopBanner(doc_index_url));

        for (const pack of packages) {

            if (options.onPackGenerateStart?.(pack.name, pack.url) === false) {
                continue
            }
            console.log(`generating ${pack.name}...`);

            try {
                options.generate_banner && fs.appendFileSync(path.resolve(options.output_path), createPackageBanner(pack.name, pack.url));

                const types = await getTypesLinks(pack.url);
                /**
                 * @type {{template: string, type_info: TypeInfo}[]}
                 */
                // @ts-ignore
                const results = await Promise.all(types.map(async (type_url) => {
                    try {
                        const content = await httpGet(type_url);
                        const dom = new jsdom.JSDOM(content);
                        const document = dom.window.document;
                        let template_str = ''
                        const method_summary = document.querySelector('#method-summary');
                        if (method_summary) {
                            template_str = await this.generateInterface(document);
                        }
                        const enum_constant_summary = document.querySelector('#enum-constant-summary');
                        if (enum_constant_summary) {
                            template_str = await this.generateEnum(document, enum_constant_summary);
                        }
                        if (!template_str) {
                            console.error(`generating type ${type_url} failed`)
                            return ''
                        }
                        const type_info = this.getTypeInfo(document)
                        console.error(`resolved ${type_url}`)
                        return { template: template_str, type_info }
                    } catch (e) {
                        return e
                    }
                }))

                fs.appendFileSync(path.resolve(options.output_path), results.map(r => r.template).join('\n\n'));

                options.onPackGenerateFinish?.(pack.name, pack.url, results.map(r => r.type_info).filter(Boolean))
            } catch (e) {
                console.error(e);
                console.error(`generating package ${pack.name} failed: ${String(e)}`);
            }
        }

        this.translator.stop()
        console.log('finished!');
    }


    /**
     * @param {string} doc_index_url 
     * @param {Document} document 
     * @returns 
     */
    getAllPackages(doc_index_url, document) {
        let root = document.querySelector('#all-packages-table');
        if (!root) {
            root = document.querySelector('#package-summary-table');
        }

        if (root) {
            return Array.from(root.querySelectorAll('.col-first'))
                .filter(e => e.classList.contains('table-header') === false)
                .map((e) => ({
                    name: e.textContent || '',
                    url: doc_index_url.replace(doc_index_url.split('/').at(-1) || '', e.querySelector('a')?.href || '')
                }))
                .filter(Boolean)
        }

        return []
    }

    /**
     * @param {Document} document
     * @param {Element} enum_constant_summary_root 
     * @returns 
     */
    generateEnum(document, enum_constant_summary_root) {
        const root = enum_constant_summary_root
        const { type_name, type_desc, extends_str } = this.getTypeInfo(document)

        const names = Array.from(root.querySelectorAll('.col-first'))
            .filter(e => e.classList.contains('table-header') === false)
        const descriptions = Array.from(root.querySelectorAll('.col-last'))
            .filter(e => e.classList.contains('table-header') === false)

        const enum_class_name = `${type_name}Enum`

        const lines = [
            '/** ',
            type_desc ? type_desc.split('\n').map(s => `   ${s}`).filter(Boolean).join('\n') : '',
            ' */',
            `interface ${type_name}  ${extends_str ? 'extends ' + extends_str : ''} {}`,
            `interface ${enum_class_name} {`,
            ...names.map((name, i) => {
                const desc = (descriptions[i].textContent || '').trim()
                return `${desc ? `/** ${this.translator.translate(desc)} */\n` : ''}${name.textContent || ''} : ${type_name},`
            }),
            '}',
        ]

        return lines.filter(Boolean).join('\n')
    }


    /**
     * 
     * @param {Document} document  
     * @returns 
     */
    generateInterface(document) {
        const type_info = this.getTypeInfo(document)
        const { type_desc, type_name, extends_str, modifiers } = type_info

        if (this.options.onTypeGenerateStart && this.options.onTypeGenerateStart(type_info) === false) {
            return ''
        }

        const constructor_details = this.getConstructor(document, type_desc, type_name)
        const { template: constructor_template, comments } = constructor_details

        const lines = [
            ...(modifiers.includes('class') ? [
                // generate comment in constructor interface 
            ] : [
                '/** ',
                comments,
                ' */',
            ]),
            constructor_template,
            `interface ${type_name} ${extends_str ? 'extends ' + extends_str : ''} {`,
            ...(this.getFields(document, ({ modifiers }) => {
                return modifiers.includes('static') === false
            })),
            ...(this.getMethods(document, (details) => {
                return !!details && details.modifiers.includes('static') === false
            })),
            '}'
        ]

        const template = '\n' + lines.filter(Boolean).join('\n')
        if (this.options.onTypeGenerateFinish && this.options.onTypeGenerateFinish(type_info, template) === false) {
            return ''
        }

        return template
    }


    /**
     * get fields
     * @param {Document} document 
     * @param {(details: FieldDetails )=>boolean} filter
     */
    getFields(document, filter = () => true) {
        const root = document.querySelector('#field-summary');
        if (!root) {
            return []
        }


        const types = Array.from(root.querySelectorAll('.col-first'))
            .filter(e => e.classList.contains('table-header') === false)

        const fields = Array.from(root.querySelectorAll('.col-second'))
            .filter(e => e.classList.contains('table-header') === false)
            .map((e) => e.textContent || '')

        const descriptions = Array.from(root.querySelectorAll('.col-last'))
            .filter(e => e.classList.contains('table-header') === false)
            .map((e) => e.textContent || '')


        return fields.map((field, i) => {
            const desc = descriptions[i].split('\n').join('. ')
            const details = this.getFieldDetails((types[i].textContent || ''))
            if (filter(details) === false) return '' 
            return `${desc ? `/** ${this.translator.translate(desc)} */\n` : ''} ${field} : ${details.type}`
        })

    }


    /**
     * get constructor
     * @param {Document} document 
     */
    getConstructor(document, type_desc = '', type_name = '') {
        const root = document.querySelector('#constructor-summary');
        const name_without_generic_type = type_name.replace(/<.*>/, '')
        if (!root) {
            return { template: `\n/** */\ninterface ${name_without_generic_type}Constructor {new():${name_without_generic_type}}\n`, comments: '' }
        }

        const constructors = Array.from(root.querySelectorAll('.col-constructor-name'))
            .filter(e => e.classList.contains('table-header') === false)
            .map((e) => e.textContent || '')

        const descriptions = Array.from(root.querySelectorAll('.col-last'))
            .filter(e => e.classList.contains('table-header') === false)
            .map((e) => e.textContent || '')


        const comments = type_desc ? this.translator.translate(type_desc.split('\n').map(s => `   ${s}`).filter(Boolean).join('\n')) : ''

        const static_methods = this.getMethods(document, (details) => {
            return !!details && details.modifiers.includes('static')
        })

        const lines = [
            '/** ',
            comments,
            '*/',
            `\ninterface ${name_without_generic_type}Constructor {`,
            ...constructors.map((constructor, i) => {
                const details = this.getConstructorDetails(document, i);
                if (!details) return ''


                const desc = descriptions[i].split('\n').join('. ')
                const lines = [
                    '/** ',
                    `   ${this.translator.translate(desc)}`,
                    ...details.params.map((p) => `   * @param {${p.type}} ${p.name} ${this.translator.translate(p.desc)}`),
                    '*/',
                    `new(${details.params.map(p => `${p.name} : ${p.type}`)}) : ${type_name.replace(/<.*>/, '<any>')}`,
                ]
                return lines.filter(Boolean).join('\n')
            }),
            ...(this.getFields(document, ({ modifiers }) => {
                return modifiers.includes('static') === true
            })),
            ...static_methods,

            '}',
        ]

        return { template: lines.filter(Boolean).join('\n'), comments }
    }

    /**
     * get methods
     * @param {Document} document  
     * @param {(details: MethodDetails )=>boolean} filter
     */
    getMethods(document, filter = () => true) {
        const root = document.querySelector('#method-summary');
        if (!root) {
            return []
        }

        const methods = Array.from(root.querySelectorAll('.col-second'))
            .map((e) => e.textContent || '')
            .filter((t) => !config.ignores_methods.some((m) => t.includes(m)));

        return methods.map((method, i) => {
            const details = this.getMethodDetails(document, method);
            if (!details) return ''

            if (filter(details) === false) return ''

            this.options.onMethodHandle?.(details)

            const function_template = ` ${details.method_name}${details.type_parameters}(${details.params.map((p) => `${p.annotations.length ? `/** ${p.annotations.join(',')} */` : ''} ${p.name}: ${p.type}`).join(', ')}) : ${details.return_type}`

            if (!details.method_comment && !details.annotations.length && !details.params.length && !details.return_type_comments.length && !details.throws_comments.length && !details.deprecation_comment) {
                return function_template
            }

            const lines = [
                '/** ',
                details.method_comment ? this.translator.translate(details.method_comment.split('\n').map(s => `   ${s.trim()}`).join('\n')) : '',
                ...details.annotations.map((a) => ` * ${a}`),
                ...details.params.map((p) => ` * @param {${p.type}} ${p.name} ${this.translator.translate(p.desc)}`),
                details.return_type === 'void' ? '' : ` * @returns {${details.return_type}} ${this.translator.translate(details.return_type_comments.join(', '))}`,
                ...details.throws_comments.map((a) => ` * @throws ${this.translator.translate(a)}`),
                details.deprecation_comment ? ` * @deprecated ${this.translator.translate(details.deprecation_comment)}` : '',
                ' */',
                function_template
            ]

            return lines.filter(Boolean).join('\n')
        });

    }


    /**
     * get type infos such as class/interface/enum 
     * @param {Document} document 
     */
    getTypeInfo(document) {
        const modifiers = document.querySelector('.type-signature .modifiers')?.textContent || '';
        const type_name = (document.querySelector('.element-name')?.textContent || '').replace(/\./g, '_');
        const type_desc = document.querySelector('.class-description .block')?.textContent || '';
        let extends_str = document.querySelector('.extends-implements')?.textContent || '';
        extends_str = extends_str.replace('extends', ' ').replace('implements', ' ')
        extends_str = resolveGenericTypes(extends_str).replace(/\./g, '_').trim()
            .replace(/,/g, ' ')
            .replace(/\s+/g, ',')
            .split(',').map((t) => getJsType(t)).join(', ')
        const info = {
            type_name: getJsType(type_name),
            type_desc: resolveComment(type_desc),
            extends_str,
            modifiers
        }
        this.options.onTypeHandle?.(info)
        return info
    }

    getFieldDetails(field_str = '') {
        let type_str = (field_str);
        for (const default_modifier of java_defaults_modifiers) {
            type_str = type_str.replace(default_modifier, '').trim()
        }
        type_str = type_str.split(' ').filter(s => s.startsWith('@') === false).join(' ')
        const annotations = field_str.split(' ').filter(s => s.startsWith('@'))
        const modifiers = (field_str).replace(type_str, '').trim().split(' ').filter(Boolean).join(' ')
        const type = resolveGenericTypes(getJsType(type_str))
        return { type, modifiers, annotations }
    }




    /** 
     * @param {Document} document  
     * @param {number} index
     * @returns {ConstructorDetails | undefined}
     */
    getConstructorDetails(document, index) {
        const root = document.querySelector(`#constructor-detail li:nth-child(${index + 1})`);
        if (!root) {
            return
        }

        const constructor_params_str = (root.querySelector('.member-signature .parameters')?.textContent || '').match(/\(([\s\S]*)\)/)?.[1] || '';
        const deprecation_comment = root.querySelector('.deprecation-block .deprecation-comment')?.textContent || '';
        const method_comment = root.querySelector('.block')?.textContent || '';

        const notes = getDetailsNotes(root)
        const params = this.resolveParams(constructor_params_str, notes)
        const info = {
            deprecation_comment: resolveComment(deprecation_comment),
            method_comment: resolveComment(method_comment),
            params
        }
        this.options.onConstructorHandle?.(info)
        return info
    }

    /** 
     * @param {Document} document 
     * @param {string} method_str
     * @returns {MethodDetails | undefined}
     */
    getMethodDetails(document, method_str = '') {
        const method_name = method_str.split('(')[0];
        const root = document.querySelector(`#method-detail [id^="${method_name}"]`);
        if (!root) {
            return
        }

        const method_params_str = (root.querySelector('.member-signature .parameters')?.textContent || '').match(/\(([\s\S]*)\)/)?.[1] || '';

        const modifiers = root.querySelector('.member-signature .modifiers')?.textContent || '';
        const type_parameters = root.querySelector('.member-signature .type-parameters')?.textContent || '';
        const return_type = root.querySelector('.member-signature .return-type')?.textContent || '';
        const annotations = root.querySelector('.member-signature .annotations')?.textContent || '';

        const deprecation_comment = root.querySelector('.deprecation-block .deprecation-comment')?.textContent || '';
        const method_comment = root.querySelector('.block')?.textContent || '';

        const notes = getDetailsNotes(root)
        const params = this.resolveParams(method_params_str, notes)

        let resolved_return_type = return_type
        resolved_return_type = resolved_return_type.replace(/<.*>/g, (match) => resolveGenericTypes(match))
        resolved_return_type = resolved_return_type.replace(/\(.*\)/g, (match) => resolveAnnotation(match))
        const details = {
            modifiers,
            method_name,
            params,
            return_type: getJsType(resolved_return_type.split(' ').at(-1)),
            annotations: annotations.split('\n').filter(Boolean),
            deprecation_comment: resolveComment(deprecation_comment),
            method_comment: resolveComment(method_comment),
            return_type_comments: (notes['Returns:'] || []).map(resolveComment),
            throws_comments: (notes['Throws:'] || []).map(resolveComment),
            type_parameters: type_parameters.includes('?') ? '<any>' : type_parameters
        }
        this.options.onMethodHandle?.(details)
        return details
    }

    /**
     * 
     * @param {string} method_params_str 
     * @param {Record<string, string[]>} notes 
     * @returns {Param[]}
     */
    resolveParams(method_params_str = '', notes = {}) {

        let resolved_method_params_str = method_params_str
        resolved_method_params_str = resolved_method_params_str.replace(/<.*>/g, (match) => resolveGenericTypes(match))
        resolved_method_params_str = resolved_method_params_str.replace(/\(.*\)/g, (match) => resolveAnnotation(match))

        const params = resolved_method_params_str.replace(/\s+/g, ' ').split(', ').filter(Boolean).map((param_str) => {
            const annotations = param_str.split(' ').filter((p) => p.startsWith('@'))
            const is_rest = param_str.includes('...')
            param_str = param_str.replace('...', '').replace(/\s+/g, ' ')
            const type = param_str.split(' ').filter((p) => !p.startsWith('@')).at(-2) || ''
            const name = param_str.split(' ').at(-1) || ''

            const desc = notes['Parameters:']?.find((/** @type {string} */ p) => p.split('-')[0].startsWith(name))?.split('-')[1]

            return {
                name: (is_rest ? '...' : '') + (name || ''),
                type: getJsType(type) + (is_rest ? '[]' : ''),
                annotations: Array.from(new Set(annotations)),
                desc: resolveComment(desc || '')
            }
        }).map(p => {
            for (const replace of config.not_allowed_param_replaces) {
                p.name = p.name.replace(new RegExp(replace.split('-')[0]), replace.split('-')[1])
            }
            return p
        })
        for (const param of params) {
            this.options.onPramHandle?.(param)
        }
        return params
    }
}



async function getTypesLinks(package_index_url = '') {
    const content = await httpGet(package_index_url);
    const dom = new jsdom.JSDOM(content);
    const document = dom.window.document;

    const root = document.querySelector('#class-summary');
    if (!root) {
        return []
    }

    const types = Array.from(root.querySelectorAll('.col-first'))
        .filter(e => e.classList.contains('table-header') === false)
        .map((e) => package_index_url.replace(package_index_url.split('/').at(-1) || '', e.querySelector('a')?.href || ''))
        .filter(Boolean)

    return types
}



function resolveComment(comment = '') {
    return comment.replace(/\/\*/g, '\\/*').replace(/\*\//g, '*\\/')
}


function getJsType(java_type = '') {
    const name = java_type.match(param_name_regexp)?.[0] || ''

    if (!name) {
        return java_type
    }

    const resolved = config.types_mapping.find((t) => t.split('-')[0] === name)?.split('-')[1] || name
    return java_type.replace(param_name_regexp, resolved.replace(/\./g, '_'))
}


/**
 * 
 * @param {Element} root 
 */
function getDetailsNotes(root) {
    /** @type {Record<string, string[]>} */
    const notes = Object.create({})
    const notes_elements = Array.from(root.querySelector('.notes')?.children || [])
    let current_note = ''
    for (const element of notes_elements) {
        if (element.tagName.toLowerCase() === 'dt') {
            const text = element.textContent?.trim()
            if (!text) continue
            current_note = text
            notes[current_note] = []
        }
        if (element.tagName.toLowerCase() === 'dd') {
            const text = element.textContent?.trim()
            if (!text) continue
            notes[current_note].push(text)
        }
    }

    return notes
}

/**
 * 
 * @param {string} type 
 * @returns 
 */
function resolveGenericTypes(type = '') {
    if (type.match(/<.*>/)) {
        if (type.includes('?')) {
            return type.replace(/<.*>/, '<any>')
        }
        const generic_type_str = type.match(/<(.*)>/)?.[1] || ''
        const types = generic_type_str.split(',').map((t) => t.trim()).map(t => t.split(' ').filter(s => s.startsWith('@') === false).at(-1)?.trim() || '')
        return type.replace(/<.*>/, `<${types.map((t) => getJsType(t)).join(',')}>`)
    }
    return type
}

function resolveAnnotation(annotation = '') {
    if (annotation.match(/\(.*\)/)) {
        return annotation.replace(/\(.*\)/, (match) => match.replace(/\s+/, ''))
    }
    return annotation
}



exports.Generator = Generator