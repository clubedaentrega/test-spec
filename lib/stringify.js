'use strict'

/**
 * Turn a section into a string
 * @param {Section} section
 * @returns {string}
 */
module.exports = function (section) {
	var newSource = '',
		lastBlock = null,
		lastNL = 0

	var stringify = function (block) {
		if (block.type === 'section') {
			if (lastBlock &&
				lastBlock.type === 'section' &&
				lastBlock.level !== block.level) {
				newSource += '\n'
			}
			newSource += block.content + '\n'
			lastNL = 1
		} else if (block.type === 'text') {
			newSource += block.content + '\n\n'
			lastNL = 2
		} else if (block.type === 'code') {
			newSource += '```' + block.language + '\n' + block.content + '\n```\n\n'
			lastNL = 2
		} else if (block.type === 'value') {
			newSource += block.content + '\n\n'
			lastNL = 2
		}

		lastBlock = block
		if (block.type === 'section') {
			block.children.forEach(stringify)
		}
	}

	stringify(section)

	return newSource.substr(0, newSource.length - lastNL)
}