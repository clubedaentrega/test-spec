# Test Spec Parser
[![Build Status](https://travis-ci.org/clubedaentrega/test-spec.svg?branch=master)](https://travis-ci.org/clubedaentrega/test-spec)
[![Inline docs](http://inch-ci.org/github/clubedaentrega/test-spec.svg?branch=master)](http://inch-ci.org/github/clubedaentrega/test-spec)
[![Dependency Status](https://david-dm.org/clubedaentrega/test-spec.svg)](https://david-dm.org/clubedaentrega/test-spec)

A parser and runtime for markdown-inspired documentation and testing files

## Install
`npm install @clubedaentrega/test-spec --save`

## Status
**IN PROGRESS**

## Usage
```js
let testSpec = require('@clubedaentrega/test-spec')

// Usually, the source is read from some *.md file
let source = '# Title\n'+
	'## Section\n'+
	'Some textual comment\n'+
	'\texecute_some_code()'

let tree = testSpec.parse(source)
```