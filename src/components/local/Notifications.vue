<script setup>
import { ref, reactive, nextTick } from "vue"

/**
 * Store
 */
import { useNotificationsStore } from "@store/notifications"
const notificationsStore = useNotificationsStore()

const firstNotificationHeight = ref(0)
const heights = reactive({})

const notificationsStyles = (index) => {
	let heightBefore = 0

	for (let i = 0; i < Object.keys(heights).length; i++) {
		if (i >= index) break
		const height = heights[i]
		heightBefore += height
	}

	return {
		"---currentNotificationHeight": `${heights[index]}px`,
		"---notificationsBefore": index,
		"---notificationsHeightBefore": `${heightBefore}px`,
		"z-index": notificationsStore.items.length - index,
	}
}

const getIcon = (type) => {
	if (type.toLowerCase() == "success") return "Checkcircle"
	if (type.toLowerCase() == "info") return "Help"

	return "Warning"
}

const handleActionCallback = (callback, notification) => {
	callback()

	notificationsStore.remove({ id: notification.id })
}

notificationsStore.$subscribe(() => {
	nextTick(() => {
		const notificationsEls = document.querySelectorAll("#notification")
		notificationsEls.forEach((el, index) => {
			heights[index] = el.clientHeight
		})

		firstNotificationHeight.value = `${notificationsEls[0]?.clientHeight}px`
	})
})
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.notifications">
			<transition-group name="fastfade">
				<div
					v-for="(notification, index) in notificationsStore.items"
					:key="notification.id"
					id="notification"
					:class="[
						$style.notification,
						index !== 0 && $style.stacked,
					]"
					:style="notificationsStyles(index)"
				>
					<Icon
						v-if="notification.type || notification.icon"
						:name="
							notification.type
								? getIcon(notification.type)
								: notification.icon
						"
						size="16"
						:class="[
							$style.general_icon,
							$style[notification.type],
						]"
					/>

					<div :class="$style.base">
						<div :class="$style.title">
							{{ notification.title }}
						</div>

						<div
							v-if="notification.description"
							:class="$style.description"
						>
							{{ notification.description }}
						</div>

						<div v-if="notification.badges" :class="$style.badges">
							<div
								v-for="(badge, bIndex) in notification.badges"
								:key="bIndex"
								:class="$style.badge"
							>
								<Icon
									:name="badge.icon"
									size="16"
									:style="{
										fill: `var(--${badge.iconColor})`,
									}"
								/>
								<span
									v-if="badge.secondaryText"
									:class="$style.secondary"
									>{{ badge.secondaryText }}</span
								>
								<span
									v-if="badge.tertiaryText"
									:class="$style.tertiary"
									>{{ badge.tertiaryText }}</span
								>
							</div>
						</div>

						<div
							v-if="notification.actions"
							:class="$style.actions"
						>
							<Flex
								v-for="(action, aIndex) in notification.actions"
								:key="aIndex"
								@click="
									handleActionCallback(
										action.callback,
										notification,
									)
								"
								align="center"
								gap="6"
								:class="$style.action"
							>
								<Icon
									v-if="action.icon"
									:name="action.icon"
									size="12"
								/>
								{{ action.name }}
							</Flex>
						</div>
					</div>

					<Icon
						@click="
							notificationsStore.remove({ id: notification.id })
						"
						name="Close"
						size="12"
						:class="$style.close_icon"
					/>
				</div>
			</transition-group>
		</div>
	</div>
</template>

<style module>
.wrapper {
	position: fixed;
	bottom: 32px;
	right: 32px;

	z-index: 1002;
}

.notifications {
	position: relative;
}

@keyframes slidein {
	from {
		transform: translateY(50px);
	}

	to {
		transform: 0;
	}
}

.notification {
	animation-duration: 400ms;
	animation-name: slidein;

	position: absolute;
	bottom: 0;
	right: 0;

	display: flex;
	gap: 10px;

	box-sizing: border-box;
	width: 330px;
	background: var(--notification-bg);
	backdrop-filter: blur(10px);
	box-shadow: rgb(0 0 0 / 8%) 0px 4px 13px;
	border-radius: 8px;
	padding: 16px;

	---offset: calc(
		-1 * (var(---notificationsHeightBefore) + 12px *
					var(---notificationsBefore))
	);
	---firstNotificationHeight: v-bind(firstNotificationHeight);

	transition: all 400ms ease;
}

.notification::before {
	content: "";
	position: absolute;
	top: calc(12px * -1);
	left: 0px;
	right: 0px;
	height: 12px;
}

.notification.stacked {
	transform: translateY(
			calc(
				-15px * var(---notificationsBefore) + (var(
								---currentNotificationHeight
							) - var(---firstNotificationHeight))
			)
		)
		scale(calc(-1 * var(---scale)));
	---scale: var(---notificationsBefore) * 0.05 + 1;
}

.notifications:hover .notification.stacked {
	transform: translateY(var(---offset));
	height: initial;
}

.base {
	display: flex;
	flex-direction: column;
}

.general_icon {
	fill: var(--opacity-40);
}

.general_icon.success {
	fill: var(--green);
}

.general_icon.warning {
	fill: var(--text-secondary);
}

.general_icon.error {
	fill: var(--text-error);
}

.title {
	font-size: 13px;
	font-weight: 600;
	line-height: 14px;
	color: var(--text-primary);
}

.description {
	font-size: 13px;
	font-weight: 500;
	line-height: 20px;
	color: var(--text-tertiary);

	max-width: 250px;

	margin-top: 8px;
}

.badges {
	display: flex;
	align-items: center;
	gap: 8px;

	margin-top: 12px;
}

.badge {
	display: flex;
	align-items: center;
	gap: 6px;

	height: 28px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.05);

	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	fill: var(--text-tertiary);

	padding: 0 8px;
}

.badge .secondary {
	color: var(--text-secondary);
}

.badge .tertiary {
	color: var(--text-tertiary);
}

.actions {
	display: flex;
	align-items: center;
	gap: 16px;

	margin-top: 12px;
}

.action {
	font-size: 13px;
	font-weight: 600;
	color: var(--text-blue);
	fill: var(--text-blue);

	cursor: pointer;

	transition: color 0.2s ease;
}

.action:hover {
	color: var(--blue);
}

.close_icon {
	transition: all 0.2s ease;

	width: 10px;
	height: 10px;
	position: absolute;
	right: 8px;
	top: 8px;
	fill: var(--text-secondary);
	background: rgba(255, 255, 255, 0.1);
	padding: 4px;
	box-sizing: content-box;
	border-radius: 50%;
	cursor: pointer;
	opacity: 0;

	transition: all 0.2s ease;
}

.notification:hover .close_icon {
	opacity: 0.5;
}

.notification .close_icon:hover {
	opacity: 1;
}
</style>
