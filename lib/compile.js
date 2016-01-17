'use strict'

let getSnippet = require('./getSnippet')

/**
 * Compile a given value into a JS function
 * @param {string} source
 * @param {Value} value
 * @returns {function(Object):*}
 */
module.exports = function (source, value) {
	let code = 'with (__context) {',
		n = 0

	compileValue(value)
	code += '\n}\nreturn __0'

	/*jshint evil:true*/
	let fun = new Function('__context, __mixin, __pos', code)
	return function (context) {
		let pos = {
			line: 1,
			size: 1
		}
		try {
			return fun(context, null, pos)
		} catch (err) {
			let snippet = getSnippet(source, pos.line, pos.size)
			err.message = `\n${snippet}\n\n${err.message}`
			throw err
		}
	}

	/**
	 * Compile a value and append to generated code
	 * @param {Value} value
	 * @returns {string} - the resulting variable name
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
	 */
	function compileMixin(value) {
		let name = `__${n++}`,
			base = value.base.replace(/\.(\d+)(?=\.|$)/g, '[$1]'),
			removals = value.removals.map(e => `'${escape(e)}'`).join(', '),
			additions = compileObject({
				keys: value.additions
			})

		code += `\n__pos.line = ${value.line}, __pos.size = ${value.size}`
		code += `\nvar ${name} = __mixin(${base}, [${removals}], ${additions})`

		return name
	}

	/**
	 * @param {Value} value
	 * @returns {string}
	 */
	function compileJS(value) {
		let name = `__${n++}`

		code += `\n__pos.line = ${value.line}, __pos.size = ${value.size}`
		code += `\nvar ${name}`
		code += `\n${name} = ${value.code}`

		return name
	}
}

/**
 * Make it safe to put around simple quotes
 * @param {string} str
 * @returns {string}
 */
function escape(str) {
	return String(str)
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/'/g, '\\\'')
}