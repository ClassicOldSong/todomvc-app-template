// Import base config
import base from './rollup.base'

const {input, name, plugins, proPath, bundle} = base

const config = {
	input,
	output: {
		name,
		file: `${proPath}/${bundle}.js`,
		format: 'iife',
		sourcemap: true,
		globals: {
			'ef.js': 'ef'
		}
	},
	external: ['ef.js'],
	plugins
}

export default config
