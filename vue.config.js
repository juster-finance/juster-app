const webpack = require("webpack")

module.exports = {
	lintOnSave: false,
	transpileDependencies: ["vue-meta"],
	configureWebpack: {
		module: {
			rules: [
				{
					test: /\.mjs$/,
					include: /node_modules/,
					type: "javascript/auto",
				},
			],
		},

		resolve: {
			fallback: {
				buffer: require.resolve("buffer"),
				stream: require.resolve("stream-browserify"),
				crypto: false,
				path: false,
			},
		},
		plugins: [
			new webpack.ProvidePlugin({
				Buffer: ["buffer", "Buffer"],
			}),
		],
	},
}
