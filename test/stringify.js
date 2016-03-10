/*globals describe, it*/
'use strict'

var spec = require('..')
require('should')

describe('stringify', function () {
	var source = '# Title\n' +
		'\n' +
		'## Sub title\n' +
		'\ta: b: 2\n' +
		'\n' +
		'```js\n' +
		'1+1\n' +
		'```\n' +
		'\n' +
		'## Other sub title\n' +
		'\n' +
		'### Sub sub title\n' +
		'### Sub sub title2\n' +
		'\n' +
		'## Last sub title'

	it('should stringify a parsed tree', function () {
		spec.stringify(spec.parse(source)).should.be.equal(source)
	})

	it('should stringify a compiled tree', function () {
		spec.stringify(spec.compile(source)).should.be.equal(source)
	})
})