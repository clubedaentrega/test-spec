/*globals describe, it*/
'use strict'

var spec = require('..')
require('should')

describe('parse', function () {
	var source = '# Title\n' +
		'## Sub section\n' +
		'Some textual content\n' +
		'\tuser:\n' +
		'\t\tname: "Gui".toUpperCase()'

	it('should parse the README example', function () {
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
		var mainSection = spec.compile(source),
			value = mainSection.children[0].children[1].run()
		value.should.be.eql({
			user: {
				name: 'GUI'
			}
		})
	})

	it('should parse code blocks', function () {
		spec.parse('# A\ntext\n```lang\ncode\n```\nmore text').should.be.eql({
			type: 'section',
			name: 'A',
			line: 1,
			children: [{
				type: 'text',
				content: 'text',
				line: 2,
				size: 1
			}, {
				type: 'code',
				language: 'lang',
				content: 'code',
				line: 3,
				size: 3
			}, {
				type: 'text',
				content: 'more text',
				line: 6,
				size: 1
			}]
		})
	})
})