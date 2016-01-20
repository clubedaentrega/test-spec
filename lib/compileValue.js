'use strict'

let getSnippet = require('./getSnippet'),
	mixin = require('./mixin'),
	numericRegex = /^\d+$/

/**
 * Compile a given value into a JS function
 * @param {string} source
 * @param {Value} value
 * @returns {Value} - with subtype 'compiled'
 */
module.exports = function (source, value) {
	let code = 'with (__context) {',
		n = 0

	compileValue(value)
	code += '\n}\nreturn __0'

	let fun
	try {
		/*jshint evil:true*/
		fun = new Function('__context, __mixin, __pos', code)
	} catch (e) {
		console.log(code)
		throw e
	}

	let run = function (context) {
		let pos = {
			line: 1,
			size: 1
		}
		try {
			return fun(context || {}, mixin, pos)
		} catch (err) {
			let snippet = getSnippet(source, pos.line, pos.size)
			err.message = `${err.message}\n${snippet}`
			throw err
		}
	}

	return {
		type: 'value',
		subtype: 'compiled',
		line: value.line,
		size: value.size,
		run: run
	}

	/**
	 * Compile a value and append to generated code
	 * @param {Value} value
	 * @returns {string} - the resulting variable name
	 * @private
	 */
	function compileValue(value) {
		if (value.subtype === 'array') {
			return compileArray(value)
		} else if (value.subtype === 'object') {
			return compileObject(value)
		} else if (value.subtype === 'mixin') {
			return compileMixin(value)
		} else if (value.subtype === 'js') {
			return compileJS(value)
		}
		throw new Error(`Invalid subtype: ${value.subtype}`)
	}

	/**
	 * @param {Value} value
	 * @returns {string}
	 * @private
	 */
	function compileArray(value) {
		let name = `__${n++}`
		code += `\nvar ${name} = new Array(${value.elements.length})`
		code += `\n${name}.isUnordered = ${value.isUnordered}`

		value.elements.forEach((subValue, i) => {
			let subName = compileValue(subValue)
			code += `\n${name}[${i}] = ${subName}`
		})

		return name
	}

	/**
	 * @param {Value} value
	 * @returns {string}
	 * @private
	 */
	function compileObject(value) {
		let name = `__${n++}`
		code += `\nvar ${name} = {}`

		value.keys.forEach(each => {
			let subName = compileValue(each.value)
			code += `\n${name}['${escape(each.name)}'] = ${subName}`
		})

		return name
	}

	/**
	 * @param {Value} value
	 * @returns {string}
	 * @private
	 */
	function compileMixin(value) {
		let name = `__${n++}`,
			nameAdditions = `__${n++}`,
			base = value.base.replace(/\.(\d+)(?=\.|$)/g, '[$1]'),
			removals = value.removals.map(preparePath).join(', ')

		code += `\nvar ${nameAdditions} = new Array(${value.additions.length})`

		value.additions.forEach((addition, i) => {
			let path = preparePath(addition.name),
				subName = compileValue(addition.value)
			code += `\n${nameAdditions}[${i}] = {path: ${path}, value: ${subName}}`
		})

		code += `\n__pos.line = ${value.line}, __pos.size = ${value.size}`
		code += `\nvar ${name} = __mixin(${base}, [${removals}], ${nameAdditions})`

		return name
	}

	/**
	 * @param {Value} value
	 * @returns {string}
	 * @private
	 */
	function compileJS(value) {
		let name = `__${n++}`

		code += `\n__pos.line = ${value.line}, __pos.size = ${value.size}`
		code += `\nvar ${name} = (${value.code})`
		return name
	}

	/**
	 * Convert a path string to a JS code for an array
	 * Example: preparePath('users.0.name') -> "['users', 0, 'name']"
	 * @param {string} path
	 * @returns {string}
	 * @private
	 */
	function preparePath(path) {
		let parts = path.split('.')
		parts = parts.map(part => numericRegex.test(part) ? part : `'${escape(part)}'`)
		return `[${parts.join(', ')}]`
	}
}

/**
 * Make it safe to put around simple quotes
 * @param {string} str
 * @returns {string}
 * @private
 */
function escape(str) {
	return String(str)
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/'/g, '\\\'')
}