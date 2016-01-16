/*globals describe, it*/
'use strict'

let parser = require('..')
require('should')

describe('parse', () => {
	it('should parse the README example', () => {
		let lines = [
				'# Title\n',
				'## Section\n',
				'Some textual comment\n',
				'\tuser:\n',
				'\t\tname: "Gui"'
			],
			source = lines.join('')

		parser.parse(source).should.be.eql({
			type: 'section',
			name: 'Title',
			line: 1,
			children: [{
				type: 'section',
				name: 'Section',
				line: 2,
				children: [{
					type: 'text',
					content: 'Some textual comment',
					line: 3,
					size: 1
				}, {
					type: 'value',
					subtype: 'object',
					line: 4,
					size: 2,
					keys: [{
						name: 'user',
						value: {
							type: 'value',
							subtype: 'object',
							line: 5,
							size: 1,
							keys: [{
								name: 'name',
								value: {
									type: 'value',
									subtype: 'js',
									line: 5,
									size: 1,
									code: '"Gui"'
								}
							}]
						}
					}]
				}]
			}]
		})
	})
})