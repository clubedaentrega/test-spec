'use strict'

let compileValue = require('./compileValue')

/**
 * Compile a parsed tree, replacing all Value blocks to 'compiled' subtype
 * @param {string} source
 * @param {Section} parsed
 */
module.exports = function (source, parsed) {
	compile(parsed.children)

	function compile(blocks) {
		blocks.forEach((block, i) => {
			if (block.type === 'section') {
				compile(block.children)
			} else if (block.type === 'value' && block.subtype !== 'compiled') {
				blocks[i] = compileValue(source, block)
			}
		})
	}
}