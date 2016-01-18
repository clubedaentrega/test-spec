/*globals describe, it*/
'use strict'

let should = require('should'),
	spec = require('..'),
	context = {
		user: {
			name: 'John',
			pass: '123'
		},
		order: {
			items: [{
				name: 'a',
				price: 60
			}, {
				name: 'b',
				price: 63
			}],
			price: 123
		},
		Math: {
			random: function () {
				return 0.17
			}
		},
		randomId: function () {
			return '123456789012345678901234'
		},
		randomStr: function () {
			return 'hi'
		}
	}

describe('value syntax', function () {
	it('should work for basic properties', function () {
		check([
			'user:',
			'	name: "John"',
			'	password: "123"'
		], {
			user: {
				name: 'John',
				password: '123'
			}
		})

		check([
			'item:',
			'	name: "Chocolate" + " " + "Cake"',
			'	// prices must be like "3.14"',
			'	price: (314/100).toFixed(2)'
		], {
			item: {
				name: 'Chocolate Cake',
				price: '3.14'
			}
		})
	})

	it('should work for JS expressions', function () {
		check([
			'["sugar", "milk"]'
		], ['sugar', 'milk'])

		check([
			'Math.random()'
		], 0.17)

		check([
			'itemId:',
			'	randomId()'
		], {
			itemId: '123456789012345678901234'
		})

		check([
			'itemId: randomId()'
		], {
			itemId: '123456789012345678901234'
		})
	})

	it('should work for simple arrays', function () {
		check([
			'tags: ["light", "pink"]'
		], {
			tags: ['light', 'pink']
		})

		check([
			'tags:',
			'	*	"light"',
			'	*	"pink"'
		], {
			tags: array(['light', 'pink'], false)
		})

		check([
			'*	3',
			'*	14',
			'*	15'
		], array([3, 14, 15], false))
	})

	it('should work for unordered arrays', function () {
		check([
			'@	92',
			'@	65',
			'@	35'
		], array([92, 65, 35], true))
	})

	it('should work for more complex arrays', function () {
		check([
			'messages:',
			'	*	group: "family"',
			'		num: 2',
			'	*	group: "work"',
			'		num: 12'
		], {
			messages: array([{
				group: 'family',
				num: 2
			}, {
				group: 'work',
				num: 12
			}], false)
		})

		check([
			'*	@	1',
			'	@	2',
			'*	*	3',
			'	*	4'
		], array([array([1, 2], true), array([3, 4], false)], false))
	})

	it('should work for simple mixins', function () {
		check(['user with pass: "1234"'], {
			name: 'John',
			pass: '1234'
		})
		check(['user without name'], {
			pass: '123'
		})
		check([
			'user without name, pass; with',
			'	age: 36',
			'	token: randomStr(16)'
		], {
			age: 36,
			token: 'hi'
		})
	})

	it('should work for more complex mixins', function () {
		check(['order without items.price'], {
			items: [{
				name: 'a'
			}, {
				name: 'b'
			}],
			price: 123
		})

		check(['order without items.0.name, price'], {
			items: [{
				price: 60
			}, {
				name: 'b',
				price: 63
			}]
		})

		check(['order with items.ok: true'], {
			items: [{
				name: 'a',
				price: 60,
				ok: true
			}, {
				name: 'b',
				price: 63,
				ok: true
			}],
			price: 123
		})

		check(['order.items without 0'], [{
			name: 'b',
			price: 63
		}])
	})

	it('should work for mixins with array', function () {
		check(['order with items.0.name: "c"'], {
			items: [{
				name: 'c',
				price: 60
			}, {
				name: 'b',
				price: 63
			}],
			price: 123
		})
	})

	it('should work for escaped keys', function () {
		check(['"1 vérÿ odd \" key": 17'], {
			'1 vérÿ odd " key': 17
		})
	})

	it('should accept empty lines at the end', function () {
		check(['a: 2', '\t', '', '\t\t'], {
			a: 2
		})
	})
})

function check(lines, value) {
	let source = '#\n' + lines.map(e => `\t${e}`).join('\n'),
		parsed = spec.parse(source)
	spec.compile(source, parsed)
	should(parsed.children[0].run(context)).be.eql(value)
}

/**
 * @param {Array} elements
 * @param {boolean} isUnordered
 */
function array(elements, isUnordered) {
	elements.isUnordered = isUnordered
	return elements
}