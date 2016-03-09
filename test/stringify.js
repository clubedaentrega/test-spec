/*globals describe, it*/
'use strict'

var spec = require('..')
require('should')

describe('stringify', function () {
	var source = '# Title\n## Sub title\n\ta: b: 2\n\n```js\n1+1\n```'

	it('should stringify a parsed tree', function () {
		spec.stringify(spec.parse(source)).should.be.equal(source)
	})

	it('should stringify a compiled tree', function () {
		spec.stringify(spec.compile(source)).should.be.equal(source)
	})
})