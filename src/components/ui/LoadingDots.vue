<template>
	<Flex align="center" gap="4" :class="$style.dots">
		<div />
		<div />
		<div />
	</Flex>
</template>

<style module>
.dots div {
	width: 4px;
	height: 4px;
	border-radius: 50px;
}

.dots div:nth-child(1) {
	animation: mig 1s ease 0s infinite;
}
.dots div:nth-child(2) {
	animation: mig 1s ease 0.25s infinite;
}
.dots div:nth-child(3) {
	animation: mig 1s ease 0.5s infinite;
}

@keyframes mig {
	0% {
		background: rgba(255, 255, 255, 0.1);
	}
	40% {
		background: rgba(255, 255, 255, 0.6);
	}
	80% {
		background: rgba(255, 255, 255, 0.1);
	}
	100% {
		background: rgba(255, 255, 255, 0.1);
	}
}
</style>
