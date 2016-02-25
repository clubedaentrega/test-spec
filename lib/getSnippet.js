/** @module */
'use strict'

/**
 * Extract the code snippet in the given region
 * @param {string} source - original source
 * @param {number} line
 * @param {number} [size=1]
 * @returns {string}
 */
module.exports = function (source, line, size) {
	var lines = source.split(/\r?\n/),
		fromLine = Math.max(1, line - 2) - 1,
		toLine = Math.min(lines.length, line + size + 2)
	return lines.slice(fromLine, toLine).map(function (str, i) {
		var lineNum = i + 1 + fromLine
		if (lineNum >= line && lineNum < line + size) {
			return ' ' + lineNum + ' >> | ' + str
		}
		return ' ' + lineNum + '    | ' + str
	}).join('\n')
}