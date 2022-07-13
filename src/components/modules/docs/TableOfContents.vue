<script setup></script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.base">
			<div :class="$style.label">Content</div>

			<div :class="$style.content">
				<a href="#juster-documentation" :class="$style.head"
					>Juster Documentation</a
				>

				<ul>
					<li><a href="#why-juster">Why Juster?</a></li>
					<li><a href="#mainnet-launch">Mainnet Launch</a></li>
					<li><a href="#community">Community</a></li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	width: 100%;
	position: relative;

	padding-left: 70px;
}

.base {
	display: flex;
	flex-direction: column;
	gap: 20px;

	opacity: 0.4;

	position: sticky;
	top: 130px;

	transition: opacity 0.2s ease;
}

.wrapper:hover .base {
	opacity: 1;
}

.label {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);
}

.head {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.wrapper ul {
	display: flex;
	flex-direction: column;
	gap: 16px;

	padding-inline-start: 10px;
	list-style-type: none;

	margin: 16px 0;
}

.wrapper li {
	font-size: 14px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}
</style>
