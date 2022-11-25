<script>
import { defineComponent, reactive, ref, onMounted } from "vue"
import { useMeta } from "vue-meta"
import cloneDeep from "lodash.clonedeep"

/**
 * API
 */
import { fetchTopEvents } from "@/api/events"

/**
 * UI
 */
import Breadcrumbs from "@ui/Breadcrumbs.vue"
import Banner from "@ui/Banner.vue"

/**
 * Local
 */
import { EventCard } from "@local/EventCard"

export default defineComponent({
	name: "TopEventsBase",

	setup() {
		const breadcrumbs = reactive([
			{
				name: "All events",
				path: "/events",
			},
			{
				name: "Notable",
				path: "/events/top",
			},
		])

		/** Events */
		const topEvents = ref([])

		onMounted(async () => {
			const events = await fetchTopEvents({ limit: 9 })

			topEvents.value = cloneDeep(events).sort(
				(a, b) => a.bets.length - a.bets.length,
			)
		})

		/** Meta */
		const { meta } = useMeta({
			title: `All events`,
			description: "All available events",
		})

		return {
			breadcrumbs,
			topEvents,
		}
	},

	components: {
		Breadcrumbs,
		Banner,
		EventCard,
	},
})
</script>

<template>
	<div :class="$style.wrapper">
		<metainfo>
			<template v-slot:title="{ content }"
				>{{ content }} • Juster</template
			>
		</metainfo>

		<Breadcrumbs :crumbs="breadcrumbs" :class="$style.breadcrumbs" />

		<h1 :class="$style.title">Notable Events</h1>
		<div :class="$style.description">
			Events that have not yet begun, but are attracting the interest of
			participants
		</div>

		<div :class="$style.container">
			<div :class="$style.events_base">
				<div :class="$style.events">
					<EventCard
						v-for="event in topEvents"
						:key="event.id"
						:event="event"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
}

.breadcrumbs {
	margin-bottom: 24px;
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);

	margin-top: 8px;
	margin-bottom: 24px;
}

.container {
	display: flex;
	gap: 40px;
}

.filters_block {
	width: 300px;
}

.events_base {
	display: flex;
	flex-direction: column;
	gap: 20px;

	flex: 1;
}

.events {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
	grid-gap: 16px;
}

@media (max-width: 420px) {
	.events {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}
}
</style>
