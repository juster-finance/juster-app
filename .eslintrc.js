module.exports = {
	root: true,
	env: {
		es2021: true,
		"vue/setup-compiler-macros": true,
	},
	parserOptions: {
		ecmaVersion: 2020,
	},
	plugins: ["prettier"],
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
		"vue/attributes-order": "off",
	},
	globals: {
		defineProps: "readonly",
		defineEmits: "readonly",
		defineExpose: "readonly",
		withDefaults: "readonly",
	},
}
