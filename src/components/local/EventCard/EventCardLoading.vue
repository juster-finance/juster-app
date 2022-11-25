<script>
export default {
	name: "EventCardLoading",
}
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.header">
			<div :class="$style.symbol">
				<div />
				<div />
			</div>

			<div :class="$style.users">
				<div />
				<div />
				<div />
			</div>
		</div>

		<div :class="$style.naming">
			<div :class="$style.icon" />
			<div :class="$style.title" />
		</div>

		<div :class="$style.timing">
			<div :class="$style.first" />
			<div :class="$style.second" />
		</div>

		<div :class="$style.badges">
			<div :class="$style.large_badge" />

			<div :class="$style.badge" />
			<div :class="$style.badge" />
		</div>

		<div :class="$style.labels">
			<div :class="$style.label">
				<div :class="$style.icon" />
				<div :class="$style.title" />
			</div>
			<div :class="$style.label">
				<div :class="$style.icon" />
				<div :class="$style.title" />
			</div>
		</div>

		<div :class="$style.button" />
	</div>
</template>

<style module>
.wrapper {
	background: var(--card-bg);
	border-radius: 10px;
	padding: 20px;
}

@keyframes mig {
	0% {
		background: #2d2d2d;
	}
	50% {
		background: #555555;
	}
	100% {
		background: #2d2d2d;
	}
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;

	height: 34px;
	margin-bottom: 20px;
}

.symbol {
	position: relative;

	width: 30px;
	height: 30px;
}

.symbol div {
	width: 20px;
	height: 20px;
	background: #2d2d2d;
	border-radius: 6px;

	animation: mig 2s infinite;
}

.symbol div:first-child {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 1;

	outline: 3px solid var(--card-bg);
}

.symbol div:last-child {
	position: absolute;

	bottom: 0;
	right: 0;
}

.users {
	display: flex;
	align-items: center;
}

.users div {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: #2d2d2d;

	animation: mig 2s infinite;

	outline: 4px solid var(--card-bg);

	margin-right: -4px;
}

.naming {
	display: flex;
	align-items: center;
	gap: 6px;

	margin-bottom: 8px;
}

.naming .icon {
	width: 20px;
	height: 20px;
	border-radius: 4px;
	background: #2d2d2d;
	animation: mig 2s infinite;
	animation-delay: 1s;
}

.naming .title {
	width: 120px;
	height: 12px;
	border-radius: 4px;
	background: #2d2d2d;
	animation: mig 2s infinite;
	animation-delay: 1s;
}

.timing {
	display: flex;
	align-items: center;
	gap: 16px;

	margin-bottom: 16px;
}

.timing .first {
	width: 45px;
	height: 12px;
	border-radius: 4px;
	background: #2d2d2d;
	animation: mig 2s infinite;
	animation-delay: 1s;
}

.timing .second {
	width: 100px;
	height: 12px;
	border-radius: 4px;
	background: #2d2d2d;
	animation: mig 2s infinite;
	animation-delay: 1s;
}

.badges {
	display: flex;
	align-items: center;
	margin-bottom: 24px;
}

.large_badge {
	width: 84px;
	height: 28px;
	border-radius: 6px;
	background: #2d2d2d;
	animation: mig 2s infinite;
	animation-delay: 2s;

	margin-right: 12px;
}

.badge {
	width: 28px;
	height: 28px;
	background: #2d2d2d;
	animation: mig 2s infinite;
	animation-delay: 2s;

	border-radius: 6px;

	margin-right: 4px;
}

.labels {
	display: flex;
	flex-direction: column;
	gap: 12px;

	margin-bottom: 24px;
}

.label {
	display: flex;
	align-items: center;
	gap: 8px;
}

.label .icon {
	width: 14px;
	height: 14px;
	background: #2d2d2d;
	animation: mig 2s infinite;
	animation-delay: 3s;
	border-radius: 4px;
}

.label .title {
	width: 120px;
	height: 12px;
	background: #2d2d2d;
	animation: mig 2s infinite;
	animation-delay: 3s;
	border-radius: 4px;
}

.label:last-child .title {
	width: 80px;
}

.button {
	width: 100%;
	height: 32px;
	border-radius: 6px;
	background: #2d2d2d;
	animation: mig 2s infinite;
	animation-delay: 4s;
}
</style>
