const path = require('path')

module.exports = {
	chainWebpack: config => {
		config.plugin('define').tap(([option, ...other]) => {
			const options = {
				...option,
				BUILD_ENV: `'${process.env.BUILD_ENV}'`
			}
			return [options, ...other]
		})
	}
}