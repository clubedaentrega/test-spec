'use strict'

let getSnippet = require('./getSnippet'),
	parseValue = require('./parseValue'),
	emptyRegex = /^[ \t]*$/,
	headerRegex = /^(#+)(?: (.*))?$/

/**
 * @typedef {Object} Value
 * @property {string} type - always 'value'
 * @property {string} subtype - one of: 'array', 'object', 'mixin', 'js'
 * @property {number} line
 * @property {number} size
 * @property {?Array<Value>} elements - present for subtype 'array'
 * @property {?boolean} isUnordered - present for subtype 'array'
 * @property {?Array<{name: string, value: Value}>} keys - present for subtype 'object'
 * @property {?string} base - present for subtype 'mixin'
 * @property {?Array<string>} removals - present for subtype 'mixin'
 * @property {?Array<{name: string, value: Value}>} additions - present for subtype 'mixin'
 * @property {?string} code - present for subtype 'js'
 */

/**
 * @typedef {Object} Text
 * @property {string} type - always 'text'
 * @property {string} content - the paragraph content
 * @property {number} line
 * @property {number} size - number of lines
 */

/**
 * @typedef {Object} Section
 * @property {string} type - always 'section'
 * @property {string} name
 * @property {number} line
 * @property {Array<Section|Text|Value>} children
 */

/**
 * @param {string} source
 * @returns {Section}
 */
module.exports = function (source) {
	// Split in lines
	let lines = source.split(/\r?\n/),
		// Current section
		section = {
			type: 'section',
			name: '',
			line: 1,
			children: []
		},
		// sectionStack[sectionStack.length - 1] === section
		sectionStack = [section],
		line = 1,
		match

	// First line must be a header level 1
	if (!lines.length) {
		throwSyntaxError('Empty file')
	} else if (!(match = lines[0].match(headerRegex)) || match[1] !== '#') {
		throwSyntaxError('The file must start with a level 1 header')
	}
	section.name = match[2] || ''

	// Parse flags:
	// Whether the next block should not amend the previous
	let newBlock = true

	// Pre parse each line, without filling text content or parsing values
	for (line = 2; line <= lines.length; line++) {
		let str = lines[line - 1]

		if (emptyRegex.test(str)) {
			takeEmptyLine()
			newBlock = true
		} else if ((match = str.match(headerRegex))) {
			takeHeader(match[1].length, match[2])
		} else if (str[0] === '\t') {
			// Value
			appendLine('value')
		} else if (!/\s/.test(str[0])) {
			// Text
			appendLine('text')
		} else {
			throwSyntaxError('Invalid line. Are you using tabs?')
		}
	}

	// Gather text content and parse values
	let finalParse = function (section) {
		section.children.forEach(child => {
			if (child.type === 'section') {
				finalParse(child)
			} else if (child.type === 'text' || child.type === 'value') {
				let sliceStart = child.line - 1,
					sliceEnd = child.line + child.size - 1,
					subLines = lines.slice(sliceStart, sliceEnd)
				if (child.type === 'text') {
					child.content = subLines.join('\n')
				} else if (child.type === 'value') {
					// Remove starting tab character
					parseValue(child, subLines.map((e, i) => ({
						line: child.line + i,
						str: e.substr(1)
					})), throwSyntaxError)
				}
			}
		})
	}
	finalParse(sectionStack[0])

	return sectionStack[0]

	/**
	 * An empty line forces two consecutives text (or value) blocks to be split
	 * In any other situation, it has no special meaning
	 */
	function takeEmptyLine() {
		newBlock = true
	}

	/**
	 * Process a new header, creating a new section
	 * @param {number} level
	 * @param {?string} name
	 */
	function takeHeader(level, name) {
		let currLevel = sectionStack.length

		if (level > currLevel + 1) {
			throwSyntaxError(`Unexpected header level ${level} on section level ${currLevel}`)
		} else if (level === 1) {
			throwSyntaxError('There can be only one header level 1, the first line of the file')
		}

		// Walk out
		sectionStack.length = level - 1

		// Create section
		section = {
			type: 'section',
			name: name || '',
			line: line,
			children: []
		}
		sectionStack[sectionStack.length - 1].children.push(section)
		sectionStack.push(section)
	}

	/**
	 * Throw a syntax error in the current position
	 * @param {string} message
	 * @param {number} [errorLine=line]
	 * @param {number} [size=1]
	 * @throws {SyntaxError}
	 */
	function throwSyntaxError(message, errorLine, size) {
		errorLine = errorLine === undefined ? line : errorLine
		size = size === undefined ? 1 : size
		let snippet = getSnippet(source, errorLine, size),
			err = new SyntaxError(`${message}\n${snippet}`)
		err.line = errorLine
		throw err
	}

	/**
	 * Append the current line to the last block with the given type,
	 * or create a new one
	 * @param {string} type
	 */
	function appendLine(type) {
		let len = section.children.length
		if (newBlock ||
			!len ||
			section.children[len - 1].type !== type) {
			section.children.push({
				type: type,
				line: line,
				size: 1
			})
		} else {
			section.children[len - 1].size += 1
		}
		newBlock = false
	}
}