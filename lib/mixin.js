'use strict'

/**
 * Execute a mixin, applying some transformation on the base value, without changing it
 * @param {*} base
 * @param {Array<Array<string|number>>} removals
 * @param {Array<{path: Array<string|number>, value: *}>} additions
 * @returns {Object}
 */
module.exports = function (base, removals, additions) {
	if (!base || typeof base !== 'object') {
		throw new Error('Expected base of mixin to be a non-null object')
	}

	let result = copyDeep(base)
	removals.forEach(path => remove(result, path))
	additions.forEach(each => add(result, each.path, each.value))

	return result
}

/**
 * @param {*} x
 * @returns {*}
 * @private
 */
function copyDeep(x) {
	if (Array.isArray(x)) {
		return x.map(copyDeep)
	} else if (x && typeof x === 'object' &&
		(x.constructor === Object || !Object.getPrototypeOf(x))) {
		// Map
		let r = {}
		for (let key in x) {
			r[key] = copyDeep(x[key])
		}
		return r
	} else {
		return x
	}
}

/**
 * Remove a path from an object
 * @param {Object} obj
 * @param {Array<string|number>} path
 * @param {number} [i]
 * @throws {Error}
 * @private
 */
function remove(obj, path, i) {
	i = i || 0

	let key = path[i],
		last = i === path.length - 1

	if (!obj || typeof obj !== 'object') {
		throw new Error(`Can't remove key ${key} from non-object`)
	}

	if (Array.isArray(obj)) {
		if (typeof key !== 'number') {
			obj.forEach(function (each) {
				remove(each, path, i)
			})
		} else if (key >= 0 && key < obj.length) {
			if (last) {
				obj.splice(key, 1)
			} else {
				remove(obj[key], path, i + 1)
			}
		} else {
			throw new Error(`Can't remove index ${key} from an array with ${obj.length} elements`)
		}
	} else {
		if (typeof key !== 'string') {
			throw new Error(`Can't remove the numeric key ${key} from an object`)
		} else if (key in obj) {
			if (last) {
				delete obj[key]
			} else {
				remove(obj[key], path, i + 1)
			}
		} else {
			throw new Error(`Can't remove key ${key} from the object`)
		}
	}
}

/**
 * Add/update a path off an object
 * @param {!Object} obj
 * @param {*} value
 * @param {Array<string|number>} path
 * @param {number} [i]
 * @throws {Error}
 */
function add(obj, path, value, i) {
	i = i || 0

	let key = path[i],
		last = i === path.length - 1

	if (!obj || typeof obj !== 'object') {
		throw new Error(`Can't add key ${key}' to non-object`)
	}

	if (Array.isArray(obj)) {
		if (typeof key !== 'number') {
			obj.forEach(function (each) {
				add(each, path, value, i)
			})
		} else if (key >= 0 && key <= obj.length) {
			if (last) {
				obj[key] = value
			} else {
				add(obj[key], path, value, i + 1)
			}
		} else {
			throw new Error(`Can't add index ${key} to an array with ${obj.length} elements`)
		}
	} else {
		if (typeof key !== 'string') {
			throw new Error(`Can't add the numeric key ${key} to an object`)
		} else {
			if (last) {
				obj[key] = value
			} else {
				if (!(key in obj)) {
					obj[key] = Object.create(null)
				}
				add(obj[key], path, value, i + 1)
			}
		}
	}
}