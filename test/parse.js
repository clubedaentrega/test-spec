/*globals describe, it*/
'use strict'

let spec = require('..')
require('should')

describe('parse', () => {
	let source = '# Title\n' +
		'## Sub section\n' +
		'Some textual content\n' +
		'\tuser:\n' +
		'\t\tname: "Gui".toUpperCase()'

	it('should parse the README example', () => {
		spec.parse(source).should.be.eql({
			type: 'section',
			name: 'Title',
			line: 1,
			children: [{
				type: 'section',
				name: 'Sub section',
				line: 2,
				children: [{
					type: 'text',
					content: 'Some textual content',
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
									code: '"Gui".toUpperCase()'
								}
							}]
						}
					}]
				}]
			}]
		})
	})

	it('should run the README example', function () {
		let mainSection = spec.compile(source),
			value = mainSection.children[0].children[1].run()
		value.should.be.eql({
			user: {
				name: 'GUI'
			}
		})
	})
})