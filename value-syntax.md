# Doc Syntax
This file will cover every detail of the doc syntax, inspired in JSON and designed to be very concise and expressive.

## Basic example
	user:
		name: 'John'
		password: '123'
The equivalent JSON would be: `{"user": {"name": "John", "password": "123"}}`

## Properties are eval'd
	item:
		name: 'Chocolate' + ' ' + 'Cake'
		price: (314/100).toFixed(2) // prices must be like '3.14'
All property values will be eval'd as plain JS with some more global help functions (like `randomStr()`)

## Simple value
	['sugar', 'milk']
Evaluate a single JS expression and the obj value will be this result. This can create values that are not of type 'object', like:

	Math.random()

This syntax can also be used in a subdoc:

	itemId:
		randomId()

Is the same as:

	itemId: randomId()

## Simple arrays
Small arrays can be written directly in pure JS:

	tags: ['light', 'pink']
Or with a syntax inspired in mardown lists:

	tags:
		*	'light'
		*	'pink'
Or an array as root:

	*	3
	*	14
	*	15
## Arrays of objects
	messages:
		*	group: 'family'
			num: 2
		*	group: 'work'
			num: 12

## Unordered arrays
Act the same as an array in most cases, except matching does not considered the order of the elements. That is:
	set:
		@	3
		@	14
		@	15
matches `[15, 3, 14]`.

## Arrays of arrays
	*	*	1
		*	2
	*	*	3
		*	4
Means `[[1, 2], [3, 4]]`

## Mixins
Mixins are used to derive a similar object from a base one. Suppose `user = {name: 'John', pass: '123'}`. Then,

	user with pass: '1234'

will create the object `{name: 'John', pass: '1234'}`

	user without name

will create the object `{pass: '123'}`

To add and remove multiple properties:

	user without name, pass; with
		age: 36
		token: randomStr(16)

`without` must appear before `with`

### Paths
Mixins are not restricted to altering properties, they can also add/remove entire paths. Suppose `order = {items: [{name: 'a', price: 60}, {name: 'b', price: 63}], price: 123}`. Then,

	order without items.price

will create the object `{items: [{name: 'a'}, {name: 'b'}], price: 123}`

	order without items.0.name, price

will create the object `{items: [{price: 60}, {name: 'b', price: 63}]}`

	order with items.ok: true

will create the object `{items: [{name: 'a', price: 60, ok: true}, {name: 'b', price: 63, ok: true}], price: 123}`

	order.items without 0

gives `[{name: 'b', price: 63}]`

## Keys
All keys must be valid JS identifiers (contain only letters, numbers, _ and $) and not start with numbers (except array positions in paths like `items.0`).

Otherwise a key can be escaped with quotes, like: `"a very -strange kèy"` or `'even worse\', y u do this?'`. An example of a path with escaped key: `user."1 strange key"`. **NOTE: THIS IS A DRAFT**, escaped keys in paths don't work yet