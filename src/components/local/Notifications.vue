<script>
import { defineComponent } from "vue"

/**
 * Store
 */
import { useNotificationsStore } from "@/store/notifications"

export default defineComponent({
	name: "Notifications",

	setup() {
		const notificationsStore = useNotificationsStore()

		const getIcon = (type) => {
			if (type.toLowerCase() == "success") return "Check"

			return "Warning"
		}

		return { notificationsStore, getIcon }
	},
})
</script>

<template>
	<div :class="$style.wrapper">
		<transition-group name="popup" tag="span">
			<div
				v-for="notification in notificationsStore.notifications"
				:key="notification.id"
				:class="$style.notification"
			>
				<Icon
					:name="getIcon(notification.type)"
					size="16"
					:class="$style.general_icon"
				/>

				<div :class="$style.base">
					<div :class="$style.title">{{ notification.title }}</div>

					<div :class="$style.description">
						{{ notification.description }}
					</div>
				</div>

				<Icon
					@click="notificationsStore.remove({ id: notification.id })"
					name="Close"
					size="14"
					:class="$style.close_icon"
				/>
			</div>
		</transition-group>
	</div>
</template>

<style module>
.wrapper {
	position: fixed;
	bottom: 8px;
	right: 8px;

	z-index: 1002;
}

.wrapper p {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.notification {
	position: relative;

	display: flex;
	gap: 12px;

	box-sizing: border-box;
	width: 330px;
	background: var(--notification-bg);
	backdrop-filter: blur(10px);
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
	border-radius: 8px;
	padding: 20px;

	margin-right: 16px;
	margin-bottom: 16px;
}

.base {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.general_icon {
	fill: var(--opacity-40);
}

.general_icon.warning {
	fill: var(--icon-light);
}

.general_icon.error {
	fill: var(--text-error);
}

.title {
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary);
}

.description {
	font-size: 13px;
	font-weight: 500;
	line-height: 1.6;
	color: var(--text-tertiary);

	max-width: 250px;
}

.close_icon {
	transition: all 0.2s ease;

	width: 16px;
	height: 16px;
	position: absolute;
	right: 16px;
	top: 16px;
	fill: var(--icon);
	background: var(--gray-10);
	user-select: none;
	padding: 4px;
	box-sizing: content-box;
	border-radius: 5px;

	transition: all 0.2s ease;
}

.close_icon:hover {
	background: rgba(255, 255, 255, 0.1);
}
</style>
