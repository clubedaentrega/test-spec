/** @module */
'use strict'

var compileValue = require('./compileValue'),
	parse = require('./parse')

/**
 * Compile a (optionally) parsed tree, replacing all Value blocks to 'compiled' subtype
 * @param {string} source
 * @param {Section} [parsed] - if not provided, the source is parsed
 * @returns {Section} - the parsed Section
 */
module.exports = function (source, parsed) {
	if (!parsed) {
		parsed = parse(source)
	}

	compile(parsed.children)

	return parsed

	function compile(blocks) {
		blocks.forEach(function (block, i) {
			if (block.type === 'section') {
				compile(block.children)
			} else if (block.type === 'value' && block.subtype !== 'compiled') {
				blocks[i] = compileValue(source, block)
			}
		})
	}
}