<script>
import { defineComponent, ref, toRefs, computed } from "vue"
import { DateTime } from "luxon"
import Markdown from "markdown-it"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * Services
 */
import { toClipboard } from "@/services/utils/global"

/**
 * Store
 */
import { useNotificationsStore } from "@/store/notifications"

export default defineComponent({
	name: "ReleaseCard",
	components: { Button },

	props: { release: Object },

	setup(props) {
		const { release } = toRefs(props)

		const notificationsStore = useNotificationsStore()

		const md = ref(null)
		md.value = new Markdown({ html: true })

		const firstParagraphRegex = /\<p>(.*?)\<\/p>/
		const content = computed(
			() =>
				firstParagraphRegex.exec(
					md.value.render(release.value.Body),
				)[0],
		)

		const copyURL = () => {
			toClipboard(
				`https://app.juster.fi/releases/${release.value.slug.current}`,
			)

			notificationsStore.create({
				notification: {
					icon: "info",
					title: "Release URL copied to clipboard",
					description: "Use Ctrl+V to paste",
					autoDestroy: true,
				},
			})
		}

		return { content, DateTime, copyURL }
	},
})
</script>

<template>
	<router-link
		:to="`/releases/${release.slug.current}`"
		:class="$style.wrapper"
	>
		<div>
			<div :class="$style.card">
				<div :class="$style.when">
					{{
						DateTime.fromISO(release._updatedAt, {
							locale: "en",
						}).toFormat("dd LLL, kkkk")
					}}
				</div>

				<h2 :class="$style.title">{{ release.title }}</h2>

				<div v-html="content" :class="$style.body_preview" />

				<div :class="$style.buttons">
					<router-link :to="`/releases/${release.slug.current}`">
						<Button type="secondary" size="small">
							<Icon name="document" size="16" />Read more
						</Button>
					</router-link>

					<Button
						@click.prevent="copyURL"
						type="tertiary"
						size="small"
					>
						<Icon name="back" size="16" /> Share
					</Button>
				</div>
			</div>
		</div>
	</router-link>
</template>

<style module>
.wrapper {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.card {
	width: 100%;

	border-top: 1px solid var(--border);
	padding-top: 32px;
}

.title {
	font-size: 24px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-bottom: 16px;
}

.body_preview {
	font-size: 16px;
	line-height: 1.6;
	font-weight: 400;
	color: var(--text-secondary);

	margin-bottom: 20px;
}

.when {
	font-size: 12px;
	font-weight: 700;
	color: var(--text-tertiary);
	text-transform: uppercase;

	margin-bottom: 16px;
}

.buttons {
	display: flex;
	align-items: center;
	gap: 8px;
}
</style>
