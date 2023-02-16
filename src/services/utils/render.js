import { h } from "vue"
import merge from "lodash.merge"

const notNull = (x) => x !== null

let createElement = h

const createElementFromStyle = (block, serializers, children) => {
	if (block.style) {
		const styleSerializer = serializers.styles[block.style]

		if (styleSerializer) {
			const isCustomSerializer = typeof styleSerializer === "object"
			const headerLevel =
				block.style.startsWith("h") && block.style.length === 2
					? block.style.replace("h", "")
					: null

			return createElement(
				styleSerializer,
				{ h: headerLevel },
				isCustomSerializer ? () => children : children,
			)
		}
	}
	return children.flatMap((a) => a)
}

const blockIsSpan = (block) => {
	return block._type === "span" && "marks" in block && "text" in block
}

const serializerIsVueComponent = (serializer) => {
	return (
		typeof serializer === "object" &&
		("template" in serializer ||
			"setup" in serializer ||
			"render" in serializer ||
			"ssrRender" in serializer)
	)
}

const findBlockSerializer = (block, serializers) => {
	if (block._type === "list") {
		return serializers.list
	}
	if ("listItem" in block) {
		return serializers.listItem
	}
	if (blockIsSpan(block)) {
		return serializers.span
	}
	return serializers.types[block._type]
}

// Typically returns an array of text nodes
// but might also include a VNode of a line break (<br>)
const renderText = (text, serializers) => {
	const lines = text.split("\n")
	for (let line = lines.length; line-- > 1; ) {
		lines.splice(line, 0, serializers.hardBreak())
	}
	return lines
}

const attachMarks = (span, remainingMarks, serializers, markDefs) => {
	const [mark, ...marks] = remainingMarks

	if (!mark) {
		return renderText(span.text, serializers)
	}

	const markDef =
		mark in serializers.marks
			? { _type: mark, _key: "" }
			: markDefs.find((m) => m._key === mark)

	const serializer = markDef ? serializers.marks[markDef._type] : "span"

	if (serializerIsVueComponent(serializer)) {
		const props = extractProps(markDef)
		return createElement(serializer, { props }, () =>
			attachMarks(span, marks, serializers, markDefs),
		)
	}

	if (typeof serializer === "function") {
		return serializer(
			markDef || {},
			attachMarks(span, marks, serializers, markDefs),
		)
	}

	return createElement(serializer, { props: extractProps(markDef) }, [
		attachMarks(span, marks, serializers, markDefs),
	])
}

const spanSerializer = (span, serializers, markDefs) => {
	const defaults = ["em", "strong", "code", "a"]

	// Defaults first
	const marks = [...span.marks].sort((a, b) => {
		if (defaults.includes(a)) return 1
		if (defaults.includes(b)) return -1
		return 0
	})

	return attachMarks(span, marks, serializers, markDefs)
}

const blockTextSerializer = (block, serializers) => {
	const nodes = block.children.flatMap((span) => {
		return spanSerializer(span, serializers, block.markDefs)
	})
	return createElementFromStyle(block, serializers, nodes)
}

const underlineSerializer = (_, children) =>
	createElement("span", { style: "text-decoration: underline;" }, [children])

const highlightSerializer = (_, children) =>
	createElement("span", { style: "color: var(--violet);" }, [children])

const hardBreakSerializer = () => createElement("br")

const strikeSerializer = (_, children) =>
	createElement("span", { style: "text-decoration: line-through;" }, [
		children,
	])

const linkSerializer = (props, children) => {
	return createElement(
		"a",
		{
			href: props.url ? props.url : props.href,
			target: "_blank",
		},
		[children],
	)
}

const listSerializer = (block, serializers) => {
	const el = block.listItem === "number" ? "ol" : "ul"
	return createElement(
		el,
		{},
		renderBlocks(block.children, serializers, block.level),
	)
}

const listItemSerializer = (block, serializers) => {
	// Array of array of strings or nodes
	const children = renderBlocks(block.children, serializers, block.level)
	const shouldWrap = block.style && block.style !== "normal"
	return createElement(
		"li",
		{},
		shouldWrap
			? createElementFromStyle(block, serializers, children)
			: children,
	)
}

// Remove extraneous object properties
const extractProps = (item) => {
	if (item) {
		const { _key, _type, ...props } = item
		return props
	}
	return {}
}

const serializeBlock = (block, serializers) => {
	const serializer = findBlockSerializer(block, serializers)

	if (!serializer) return null

	if (serializerIsVueComponent(serializer)) {
		const props = extractProps(block)
		return createElement(serializer, props)
	}
	// Probably block text i.e. type 'block'
	// Could also be a span
	if (typeof serializer === "function") {
		// We do some manual type assertion here
		// the findBlockSerializer method will have narrowed down the serializer if the block is a span type
		if (blockIsSpan(block)) {
			return serializer(block, serializers, [])
		}
		return serializer(block, serializers)
	}
	// Must be a string by this point
	return createElement(serializer, {})
}

const createList = (block) => {
	return {
		_type: "list",
		_key: `${block._key}-parent`,
		level: block.level,
		listItem: block.listItem,
		children: [block],
	}
}

const nestBlocks = (blocks, level = 0) => {
	const isListOrListItem = (block) => "level" in block
	const hasChildren = (block) => block && "children" in block
	const newBlocks = []

	blocks.forEach((block) => {
		if (!isListOrListItem(block)) {
			newBlocks.push(block)
			return
		}

		const lastBlock = newBlocks[newBlocks.length - 1]

		if (block.level === level) {
			newBlocks.push(block)
			return
		}

		if (block.level && block.level > level) {
			if (
				!hasChildren(lastBlock) ||
				!isListOrListItem(lastBlock) ||
				(lastBlock.level && lastBlock.level > block.level)
			) {
				newBlocks.push(createList(block))
			} else if (
				lastBlock.level === block.level &&
				lastBlock.listItem !== block.listItem
			) {
				newBlocks.push(createList(block))
			} else {
				lastBlock.children.push(block)
			}
		}
	})

	return newBlocks
}

// Returns an array of strings, vnodes, or arrays of either
const renderBlocks = (blocks, serializers, level = 0) => {
	// Nest list items in lists
	const nestedBlocks = nestBlocks(blocks, level)

	// Loop through each block, and serialize it
	return nestedBlocks
		.map((block) => serializeBlock(block, serializers))
		.filter(notNull)
}

const defaultSerializers = {
	// For blocks
	types: {
		image: "image",
		block: blockTextSerializer,
	},
	// For marks
	marks: {
		strong: "strong",
		em: "em",
		link: linkSerializer,
		"strike-through": strikeSerializer,
		underline: underlineSerializer,
		highlight: highlightSerializer,
	},
	// For span styles
	styles: {
		h1: "h1",
		h2: "h2",
		h3: "h3",
		h4: "h4",
		h5: "h5",
		h6: "h6",
		normal: "p",
	},
	hardBreak: hardBreakSerializer,
	span: spanSerializer,
	list: listSerializer,
	listItem: listItemSerializer,
}

const component = (props, context) => {
	const serializers = merge({}, defaultSerializers, props.serializers)
	return renderBlocks(props.blocks, serializers)
}

component.props = ["blocks", "serializers"]

export default component
