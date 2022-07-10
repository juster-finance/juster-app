<script>
import { computed, defineComponent, ref, toRefs, watch } from "vue"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"

export default defineComponent({
	name: "Pagination",
	props: {
		total: {
			type: Number,
			required: true,
		},
		limit: {
			type: Number,
			required: true,
		},
		modelValue: Number,
	},

	setup(props, context) {
		const { total, limit, modelValue } = toRefs(props)

		/**
		 * START_INDEX -> plain constant
		 * By default, we always show the first page, regardless of the current page.
		 * Therefore, we need a start index, which indicates from which page to start filling the "pages"array.
		 */
		const START_INDEX = 2

		/**
		 * Simple func to fill array with "from" & "to"
		 */
		const fillPages = ({ from, to }) => {
			const pages = []

			if (from > to) return pages
			if (isNaN(from) || isNaN(to)) return pages
			if (!Number.isInteger(from) && !Number.isInteger(to)) return

			for (let index = from; index <= to; index++) {
				pages.push(index)
			}

			return pages
		}

		/** */
		const fillPagesWithShoulders = ({ from, to }) => {}

		const totalPages = computed(() => Math.ceil(total.value / limit.value))

		const pages = ref([])
		const isLimitExceeded = ref(false)

		if (totalPages.value <= 5) {
			pages.value = fillPages({ from: START_INDEX, to: totalPages.value })
		} else {
			isLimitExceeded.value = true

			pages.value = fillPages({ from: START_INDEX, to: 3 })
		}

		/**
		 * Re-build based on new total number.
		 * Until pagination is rendered (due to "v-if") filling will be performed through setup().
		 * Further changes to "total" will be tracked here -> watch(total)
		 */
		watch(total, () => {
			pages.value = []

			if (totalPages.value <= 5) {
				isLimitExceeded.value = false

				pages.value = fillPages({
					from: START_INDEX,
					to: totalPages.value,
				})
			} else {
				isLimitExceeded.value = true

				pages.value = fillPages({ from: START_INDEX, to: 3 })
			}
		})

		/**
		 * Re-build based on selected page.
		 * The main purpose of this watch(modelValue) is to limit the number of selectable pages to the
		 * left and right of the current one by one step (from 5 to 4 / 6, from 12 to 11 / 13, etc).
		 */
		watch(modelValue, () => {
			if (totalPages.value <= 5) return

			pages.value = []

			if (modelValue.value == 1) {
				pages.value = fillPages({ from: START_INDEX, to: 3 })
			} else {
				for (
					let index = modelValue.value - 1;
					index < modelValue.value + 2;
					index++
				) {
					if (index == 1) continue
					if (index > totalPages.value) continue
					if (index == totalPages.value) continue

					pages.value.push(index)
				}
			}
		})

		const selectPage = (page) => {
			context.emit("update:modelValue", page)
		}

		const nextPage = () => {
			if (modelValue.value == totalPages.value) return

			context.emit("update:modelValue", modelValue.value + 1)
		}

		const prevPage = () => {
			if (modelValue.value == 1) return

			context.emit("update:modelValue", modelValue.value - 1)
		}

		const handleJump = () => {
			const promptedPage = parseInt(
				prompt("Select a page number to jump:"),
			)

			/** only integer */
			if (isNaN(promptedPage)) return
			/** the selected page must be within the available pages */
			if (promptedPage < 1 || promptedPage > totalPages.value) return

			context.emit("update:modelValue", promptedPage)
		}

		return {
			isLimitExceeded,
			pages,
			totalPages,
			currentPage: modelValue,
			selectPage,
			nextPage,
			prevPage,
			handleJump,
		}
	},

	components: { Button, Tooltip },
})
</script>

<template>
	<div :class="$style.wrapper">
		<Button
			@click="prevPage"
			type="secondary"
			size="small"
			icon="arrow"
			:class="[$style.arrow_btn, $style.left]"
			:disabled="currentPage == 1"
		/>

		<Button
			@click="selectPage(1)"
			type="secondary"
			size="small"
			:class="[$style.page, currentPage == 1 && $style.current]"
			>1</Button
		>
		<Button
			v-if="currentPage > 3 && isLimitExceeded"
			type="secondary"
			size="small"
			disabled
			>...</Button
		>

		<Button
			v-for="page in pages"
			:key="page"
			@click="selectPage(page)"
			type="secondary"
			size="small"
			:class="[$style.page, currentPage == page && $style.current]"
			>{{ page }}</Button
		>

		<template v-if="isLimitExceeded">
			<Button
				v-if="currentPage <= totalPages - 3"
				type="secondary"
				size="small"
				disabled
				>...</Button
			>
			<Button
				@click="selectPage(totalPages)"
				type="secondary"
				size="small"
				:class="[
					$style.page,
					currentPage == totalPages && $style.current,
				]"
				>{{ totalPages }}</Button
			>
		</template>

		<Button
			@click="nextPage"
			type="secondary"
			size="small"
			icon="arrow"
			:class="[$style.arrow_btn, $style.right]"
			:disabled="currentPage == totalPages"
		/>

		<div v-if="totalPages > 10" :class="$style.jump">
			<Tooltip placement="bottom">
				<Button
					@click="handleJump"
					type="secondary"
					size="small"
					:class="$style.jump_btn"
				>
					<Icon name="bolt" size="14" />
				</Button>

				<template v-slot:content>
					Fast navigation through pages
				</template>
			</Tooltip>
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;
	gap: 8px;
}

.page {
	color: var(--text-tertiary);
}

.page.current {
	color: var(--text-primary);
}

.arrow_btn {
	fill: var(--text-primary) !important;
}

.arrow_btn.left svg {
	transform: rotate(90deg);
}

.arrow_btn.right svg {
	transform: rotate(-90deg);
}

.jump {
	margin-left: 8px;
}

.jump_btn svg {
	fill: var(--text-primary);
}

@media (max-width: 410px) {
	.arrow_btn {
		display: none;
	}
}
</style>
