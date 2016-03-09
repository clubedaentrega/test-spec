'use strict'

/**
 * Turn a section into a string
 * @param {Section} section
 * @returns {string}
 */
module.exports = function (section) {
	var newSource = '',
		lastNL = 0

	var stringify = function (block) {
		if (block.type === 'section') {
			newSource += block.content + '\n'
			lastNL = 1
			block.children.forEach(stringify)
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
	}

	stringify(section)

	return newSource.substr(0, newSource.length - lastNL)
}