const htmlEscapes = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
}
const escapeHtml = (html) => html.replace(/[&<>"']/g, (chr) => htmlEscapes[chr])

const initHighlighter = async () => {
	const hl = await window.shiki.getHighlighter({
		theme: "material-theme-palenight",
		langs: ["javascript", "python", "shell"],
	})

	return hl
}

export { initHighlighter, escapeHtml }
