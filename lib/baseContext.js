/**
 * @file Define many util functions for eval'd code
 */
'use strict'

/**
 * Generate a random string with base64 chars (A-Za-z0-9+/)
 * @param {number} [len=8]
 * @param {string} [alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/']
 * @returns {string}
 */
module.exports.randomStr = function (len, alphabet) {
	let str = ''
	len = len || 8
	alphabet = alphabet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	for (let i = 0; i < len; i++) {
		str += alphabet[Math.floor(Math.random() * alphabet.length)]
	}
	return str
}

/**
 * Generate a random string with hex chars (0-9a-f)
 * @param {number} [len=8]
 * @returns {string}
 */
module.exports.randomHex = function (len) {
	return module.exports.randomStr(len, '0123456789abcdef')
}

/**
 * Generate a random string with digits (0-9)
 * @param {number} [len=8]
 * @returns {string}
 */
module.exports.randomCode = function (len) {
	return module.exports.randomStr(len, '0123456789')
}

/**
 * Generate a random valid email address
 * @param {string} [domain='example.com']
 * @returns {string}
 */
module.exports.randomEmail = function (domain) {
	domain = domain || 'example.com'
	return 'test-' + module.exports.randomHex(24) + '@' + domain
}

/**
 * Generate a random valid url
 * @param {string} [base='http://example.com']
 * @returns {string}
 */
module.exports.randomUrl = function (base) {
	base = base || 'http://example.com'
	return base + '/' + module.exports.randomHex(24)
}

/**
 * Generate a random number
 * random() is the same as Math.random(): 0 <= x < 1
 * random(N) returns a number 0 <= x < N
 * random(M, N) returns M <= x < N
 * @param {number} [min=0]
 * @param {number} [max=1]
 * @returns {number}
 */
module.exports.random = function (min, max) {
	if (min === undefined && max === undefined) {
		return Math.random()
	} else if (max === undefined) {
		return Math.random() * min
	} else {
		return min + Math.random() * (max - min)
	}
}

/**
 * Generate a random int min <= x < max
 * randomInt() is equal to randomInt(0, 100)
 * randomInt(N) is equal to randomInt(0, N)
 * @param {number} [min=0]
 * @param {number} [max=100]
 * @returns {number}
 */
module.exports.randomInt = function (min, max) {
	if (min === undefined && max === undefined) {
		return module.exports.randomInt(0, 100)
	} else if (max === undefined) {
		return module.exports.randomInt(0, min)
	} else {
		return Math.floor(module.exports.random(min, max))
	}
}

/**
 * @returns {boolean}
 */
module.exports.randomBool = function () {
	return Math.random() < 0.5
}

/**
 * Generate a random Date previous from a given Date
 * @param {number} [interval=86.4e6]
 * @param {Date} [baseDate=new Date]
 * @returns {Date}
 */
module.exports.randomDate = function (interval, baseDate) {
	if (interval instanceof Date) {
		baseDate = interval
		interval = 86.4e6
	} else {
		interval = interval || 86.4e6
		baseDate = baseDate || new Date
	}
	return new Date(baseDate.getTime() - Math.random() * interval)
}

/**
 * Return one of its arguments
 * @param {...*} value
 * @returns {*}
 */
module.exports.randomOf = function () {
	return arguments[Math.floor(Math.random() * arguments.length)]
}

/**
 * The empty object
 */
module.exports.empty = {}