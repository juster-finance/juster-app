<template>
	<div :class="$style.wrapper">
		<div :class="$style.bar" />
	</div>
</template>

<style module>
.wrapper {
	position: relative;

	width: 32px;
	height: 6px;

	background: rgba(255, 255, 255, 0.2);
	border-radius: 50px;
}

.bar {
	position: absolute;
	top: 0;
	left: 0;

	width: 16px;
	height: 6px;

	background: #fff;
	border-radius: 50px;

	animation: anim 1s linear infinite;
}

@keyframes anim {
	0% {
		transform: translateX(16px);
	}

	50% {
		transform: translateX(0);
	}

	100% {
		transform: translateX(16px);
	}
}
</style>
