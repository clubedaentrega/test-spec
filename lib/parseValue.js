'use strict'

let objectKeyRegex = /^(?:([a-z$_][a-z0-9$_]*\??)|(['"])((\\\\|\\\2|.)*?)\2):\s*/i,
	objectPathRegex = /^((\d+|[a-z$_][a-z0-9$_]*)(\.(\d+|[a-z$_][a-z0-9$_]*))*):\s*/i,
	mixinRegex = /^(.*?) (without|with)( .*)?$/,
	mixinRemovalsRegex = /^(.*?)(;? with( .*)?)?$/,
	pathRegex = /^(\d+|[a-z$_][a-z0-9$_]*)(\.(\d+|[a-z$_][a-z0-9$_]*))*$/i,
	commentRegex = /^\s*\/\//,
	emptyRegex = /^[ \t]*$/

/**
 * Parses a value block
 * @param {Value} block - this object will be mutated
 * @param {Array<{line: number, str: string}>} lines
 * @param {function(string, number, number)} throwSyntaxError
 */
module.exports = function (block, lines, throwSyntaxError) {
	parseValue(block, lines, false)

	/**
	 * @param {Value} block
	 * @param {Array<string>} lines
	 */
	function parseValue(block, lines) {
		lines = cleanLines(block, lines)

		// Try to parse known syntax
		if (!(tryParseArray(block, lines) ||
				tryParseObject(block, lines) ||
				tryParseMixin(block, lines) ||
				tryParseJS(block, lines))) {
			throwSyntaxError('Invalid value syntax', block.line, block.size)
		}
	}

	/**
	 * @param {Value} block
	 * @param {Array<string>} lines
	 * @returns {boolean}
	 */
	function tryParseArray(block, lines) {
		if (!lines.length || (lines[0].str[0] !== '*' && lines[0].str[0] !== '@')) {
			// An array must start with a '*' or '@'
			return false
		}

		// Update block
		block.subtype = 'array'
		block.elements = []
		block.isUnordered = lines[0].str[0] === '@'

		let subValue, subLines

		lines.forEach(each => {
			let line = each.line,
				str = each.str

			if (str[0] === '*' || str[0] === '@') {
				// A new element
				if (str[1] !== '\t') {
					throwSyntaxError(`Expected a tab after ${str[0]}`, line)
				}
				if (subValue) {
					parseValue(subValue, subLines)
				}
				subValue = {
					type: 'value',
					line: line,
					size: 1
				}
				subLines = [{
					line: line,
					str: str.substr(2)
				}]
				block.elements.push(subValue)

				// Check ordering
				if (block.isUnordered !== (str[0] === '@')) {
					throwSyntaxError('Either all elements start with "*" or "@"', line)
				}
			} else if (str[0] === '\t') {
				// Value continuation
				subValue.size += 1
				subLines.push({
					line: line,
					str: str.substr(1)
				})
			} else {
				throwSyntaxError('Expected either "*", "@" or tab', line)
			}
		})
		parseValue(subValue, subLines)

		return true
	}

	/**
	 * @param {Value} block
	 * @param {Array<string>} lines
	 * @param {boolean} [allowPath=false] - whether the object keys can be paths
	 * @returns {boolean}
	 */
	function tryParseObject(block, lines, allowPath) {
		let regex = allowPath ? objectPathRegex : objectKeyRegex

		if (!lines.length || !regex.test(lines[0].str)) {
			// An object must start with '_key_:'
			return false
		}

		// Update block
		block.subtype = 'object'
		block.keys = []

		let subValue, subLines

		lines.forEach(each => {
			let line = each.line,
				str = each.str,
				match

			if ((match = str.match(regex))) {
				// A new key
				if (subValue) {
					parseValue(subValue, subLines)
				}

				// 1 for path and simple key; 3 for escaped key
				let key = allowPath ? match[1] : match[1] || match[3]
				subValue = {
					type: 'value',
					line: line,
					size: 1
				}
				subLines = [{
					line: line,
					str: str.substr(match[0].length)
				}]
				block.keys.push({
					name: key,
					value: subValue
				})
			} else if (str[0] === '\t') {
				// Value continuation
				subValue.size += 1
				subLines.push({
					line: line,
					str: str.substr(1)
				})
			} else {
				throwSyntaxError('Expected either "_key_:" or tab', line)
			}
		})
		parseValue(subValue, subLines)

		return true
	}

	/**
	 * @param {Value} block
	 * @param {Array<string>} lines
	 * @returns {boolean}
	 */
	function tryParseMixin(block, lines) {
		let match

		if (!lines.length ||
			!(match = lines[0].str.match(mixinRegex))) {
			// First line must have 'with' or 'without'
			return false
		}

		// Update block
		block.subtype = 'mixin'
		block.base = match[1]
		block.removals = []
		block.additions = []

		// Without
		let preposition = match[2],
			substr = (match[3] || '').trimLeft()
		if (preposition === 'without') {
			let subMatch = substr.match(mixinRemovalsRegex)

			if (!subMatch) {
				throwSyntaxError('Invalid mixin removal list', lines[0].line)
			}

			block.removals = subMatch[1].split(',').map(each => {
				each = each.trim()
				if (!each.match(pathRegex)) {
					throwSyntaxError(`Invalid removal path: ${each}`, lines[0].line)
				}
				return each
			})

			if (!block.removals) {
				throwSyntaxError('Empty removal list', lines[0].line)
			}

			if (subMatch[2]) {
				preposition = 'with'
				substr = (subMatch[3] || '').trimLeft()
			}
		}

		// With
		if (preposition === 'with') {
			let subValue = {
					type: 'value',
					line: lines[0].line,
					size: 1
				},
				subLines = [{
					line: lines[0].line,
					str: substr
				}]

			lines.forEach((each, i) => {
				let line = each.line,
					str = each.str
				if (!i) {
					// Ignore first line
					return
				} else if (str[0] === '\t') {
					subValue.size += 1
					subLines.push({
						line: line,
						str: str.substr(1)
					})
				} else {
					throwSyntaxError('Expected the line to start with tab', line)
				}
			})

			if (!tryParseObject(subValue, cleanLines(subValue, subLines), true)) {
				throwSyntaxError('Invalid mixin additions', subValue.line, subValue.size)
			}

			block.addtions = subValue.keys
		} else if (lines.length !== 1) {
			// Without the 'with' preposition, lines after the first are extraneous
			throwSyntaxError('Could not parse as mixin', block.line + 1, block.size - 1)
		}

		return true
	}

	/**
	 * @param {Value} block
	 * @param {Array<string>} lines
	 * @returns {boolean}
	 */
	function tryParseJS(block, lines) {
		if (lines.length !== 1) {
			return false
		}

		// Update block
		block.subtype = 'js'
		block.code = lines[0].str

		return true
	}

	/**
	 * Remove first line if empty and remove comment lines
	 * @param {Value} block
	 * @param {Array<{line: number, str: string}>} lines
	 * @returns {Array<{line: number, str: string}>}
	 */
	function cleanLines(block, lines) {
		let removeFirst = false
		if (lines.length && emptyRegex.test(lines[0].str)) {
			block.line += 1
			block.size -= 1
			removeFirst = true
		}

		return lines.filter((each, i) => {
			return !(!i && removeFirst) && !commentRegex.test(each.str)
		})
	}
}