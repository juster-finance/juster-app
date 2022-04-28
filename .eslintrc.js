module.exports = {
	root: true,
	env: {
		node: true,
		"vue/setup-compiler-macros": true,
	},
	parserOptions: {
		ecmaVersion: 2020,
		parser: "babel-eslint",
	},
	extends: [
		"plugin:vue/base",
		"plugin:vue/vue3-essential",
		"plugin:vue/strongly-recommended",
		"plugin:vue/recommended",
		"eslint:recommended",
		"@vue/prettier",
	],
	rules: {
		"no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
		"no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
	},
	globals: {
		defineProps: "readonly",
		defineEmits: "readonly",
		defineExpose: "readonly",
		withDefaults: "readonly",
	},
}
