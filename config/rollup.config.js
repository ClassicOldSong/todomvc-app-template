const path = require('path')

// Rollup plugins
const buble = require('rollup-plugin-buble')
const eslint = require('rollup-plugin-eslint')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const replace = require('rollup-plugin-replace')
const uglify = require('rollup-plugin-uglify')
const progress = require('rollup-plugin-progress')
const json = require('rollup-plugin-json')
const eft = require('rollup-plugin-eft')
const postcss = require('rollup-plugin-postcss')

// Postcss plugins
const simplevars = require('postcss-simple-vars')
const nested = require('postcss-nested')
const cssnext = require('postcss-cssnext')
const cssnano = require('cssnano')

// Other dependences
const git = require('git-rev-sync')

// ef configuration
const {
	entry = 'src/main.js',
	bundle = 'main.js',
	devPath = 'test',
	proPath = 'dist',
	format = 'iife',
	sourceMap = 'inline'
} = require('./ef.config.js')

module.exports = {
	entry,
	devDest: path.normalize(`${devPath}/${bundle}`),
	proDest: path.normalize(`${proPath}/${bundle}`),
	format,
	sourceMap,
	plugins: [
		progress({
			clearLine: false
		}),
		eslint(),
		resolve({
			jsnext: true,
			main: true,
			browser: true,
		}),
		commonjs(),
		json(),
		eft(),
		postcss({
			plugins: [
				simplevars(),
				nested(),
				cssnext({ warnForDuplicates: false }),
				cssnano()
			],
			combineStyleTags: true
		}),
		replace({
			ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
			GITVERSION: JSON.stringify(`${git.branch()}.${git.short()}`)
		}),
		buble({
			transforms: {
				modules: false,
				dangerousForOf: true
			},
			objedtAssign: 'Object.assign'
		}),
		(process.env.NODE_ENV === 'production' && uglify())
	]
}
