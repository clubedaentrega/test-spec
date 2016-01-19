# Test Spec Parser
[![Build Status](https://travis-ci.org/clubedaentrega/test-spec.svg?branch=master)](https://travis-ci.org/clubedaentrega/test-spec)
[![Inline docs](http://inch-ci.org/github/clubedaentrega/test-spec.svg?branch=master)](http://inch-ci.org/github/clubedaentrega/test-spec)
[![Dependency Status](https://david-dm.org/clubedaentrega/test-spec.svg)](https://david-dm.org/clubedaentrega/test-spec)

A parser and runtime for markdown-inspired documentation and testing files

## Install
`npm install @clubedaentrega/test-spec --save`

## Usage
```js
let spec = require('@clubedaentrega/test-spec')

// Usually, the source is read from some *.md file
let source = '# Title\n'+
	'## Sub section\n'+
	'Some textual content\n'+
	'\tuser:\n'+
	'\t\tname: "Gui".toUpperCase()'

// Compile the source to a tree of section, text and value blocks
let mainSection = spec.compile(source),
	subSection = mainSection.children[0],
	valueBlock = subSection.children[1],
	// Execute the value block
	value = valueBlock.run()

console.log(value) // {user: {name: 'GUI'}}
```

## Concepts
Testing is, at the same time:

* *very* great because it lets you trust code is ready for production!
* extremely *boring* to write, because test code is dumb and repetitive

This module tries to solve this by making testing code more concise and unifying testing and documentation.

Markdown was choosen because it's easy to write/read and it's not code!

This module is the fundamental parser and compiler for [api-test](https://github.com/clubedaentrega/api-test), but can be used separately.

## Syntax and parsing
This module implements a tiny subset of markdown: headers, paragraphs and code blocks. It does not aim at understanding any other feature (like lists, images, links, etc), but those constructions are accepted. That is, they are not considered valid syntax, but are simply treated as text.

The source is first transformed into a tree of sections (headers). Each section may have sub-sections, text paragraphs and value blocks.

## Compiling
Parsed values are compiled to native JS functions, exposing a `run()` method, like in example above.

## Value syntax
The syntax for value expressions was designed to be concise and expressive. The values will be eval'ed as normal JS with a context with special variables (see `default context` bellow).

The object can be a simple JS value, like:
```
new Date
```

Or an object with one property by line and tabs used to declare sub-objects:
```
user:
	name:
		first: 'Happy'
		last: 'Customer'
	age: 37 + 2
	country: 'cm'.toUpperCase()
```

Or mixins, like:
```
user with name.first: 'Unhappy'
```

Learn more about the syntax in the file [value-syntax.md](https://github.com/clubedaentrega/test-spec/blob/master/value-syntax.md)

## Default context
The following functions are defined in `spec.baseContext` and can be used to provide a common set of utility functions to tests.

* `randomStr([len=8], [alphabet=a-zA-Z0-9+/])`
* `randomHex([len=8])`
* `randomCode([len=8])`
* `randomEmail([domain='example.com'])`
* `randomUrl([base='http://example.com'])`
* `random([min=0],[max=1])`
* `randomInt([min=0],[max=100])`
* `randomBool()`
* `randomDate([interval=1day], [base=now])`: return a random date in the past
* `randomOf(...values)`: return one of its arguments
* `empty`: the empty object `{}`

## Docs
See [complete docs](http://clubedaentrega.github.io/test-spec)