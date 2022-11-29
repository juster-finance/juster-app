import { defineConfig } from "vite"

import vue from "@vitejs/plugin-vue"
import path from "path"
// import inject from "@rollup/plugin-inject"

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
	"@typography": path.resolve(__dirname, "./src/components/typography"),
	"@config": path.resolve(__dirname, "./src/services/config"),
	"@sdk": path.resolve(__dirname, "./src/services/sdk"),
	"@utils": path.resolve(__dirname, "./src/services/utils"),
	"@store": path.resolve(__dirname, "./src/store"),
}

export default (ctx) => {
	const isBuild = ctx.command === "build"

	return defineConfig({
		plugins: [vue(), nodePolyfills()],
		define: {
			global: "window",
		},

		// build: {
		// 	rollupOptions: {
		// 		plugins: [inject({ Buffer: ["Buffer", "Buffer"] })],
		// 	},
		// },

		resolve: {
			preferRelative: false,
			alias: {
				...aliases,

				// events: "rollup-plugin-node-polyfills/polyfills/events",
				// util: "rollup-plugin-node-polyfills/polyfills/util",
				// process: "rollup-plugin-node-polyfills/polyfills/process-es6",
				// stream: "rollup-plugin-node-polyfills/polyfills/stream",

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
