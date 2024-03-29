import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"
import replace from "rollup-plugin-re"
import vue from "@vitejs/plugin-vue"
import path from "path"

import nodePolyfills from "vite-plugin-node-stdlib-browser"

const aliases = {
	"@": path.resolve(__dirname, "./src"),
	"@ui": path.resolve(__dirname, "./src/components/ui"),
	"@base": path.resolve(__dirname, "./src/components/base"),
	"@views": path.resolve(__dirname, "./src/views"),
	"@local": path.resolve(__dirname, "./src/components/local"),
	"@layout": path.resolve(__dirname, "./src/components/layout"),
	"@modals": path.resolve(__dirname, "./src/components/local/modals"),
	"@modules": path.resolve(__dirname, "./src/components/modules"),
	"@sanity": path.resolve(__dirname, "./src/components/sanity"),
	"@typography": path.resolve(__dirname, "./src/components/typography"),
	"@api": path.resolve(__dirname, "./src/api"),
	"@config": path.resolve(__dirname, "./src/services/config"),
	"@sdk": path.resolve(__dirname, "./src/services/sdk"),
	"@utils": path.resolve(__dirname, "./src/services/utils"),
	"@store": path.resolve(__dirname, "./src/store"),
}

export default (ctx) => {
	const isBuild = ctx.command === "build"

	return defineConfig({
		plugins: [
			vue(),
			nodePolyfills(),
			...(process.env.STATS
				? [
						{
							...visualizer({
								filename: "./dist/stats.html",
								gzipSize: true,
								open: true,
							}),
							enforce: "post",
							apply: "build",
						},
				  ]
				: []),
			{
				...replace({
					include: ["node_modules/@airgap/**"],
					replaces: {
						...(isBuild && {
							"import * as qrcode from 'qrcode-generator';":
								"import qrcode from 'qrcode-generator';",
						}),
					},
				}),
				enforce: "pre",
			},
		],
		define: {
			global: "window",
			"process.env": {},
		},

		resolve: {
			preferRelative: false,
			alias: {
				...aliases,

				"@airgap/beacon-dapp": path.resolve(
					__dirname,
					`./node_modules/@airgap/beacon-dapp/dist/${
						isBuild ? "esm" : "cjs"
					}/index.js`,
				),
			},
		},
	})
}
