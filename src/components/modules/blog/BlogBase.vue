<script setup>
import { useMeta } from "vue-meta"

/** Meta */
useMeta({
	title: "Blog",
	description:
		"Learn about new features, development approaches, financial tools, and dive into releases.",
})
</script>

<template>
	<div :class="$style.wrapper">
		<metainfo>
			<template #title="{ content }">{{ content }} • Juster</template>
		</metainfo>

		<Flex justify="between" align="center">
			<h1 :class="$style.title">Blog</h1>

			<Icon name="moon" size="16" :class="$style.moon" />
		</Flex>

		<div :class="$style.divider" />

		<Flex align="center" direction="column" :class="$style.large_post">
			<div :class="$style.cover" />

			<Flex
				direction="column"
				align="center"
				gap="8"
				:class="$style.content"
			>
				<div :class="$style.category">Product Building</div>
				<h1>Summary of two quarters in 2022</h1>
				<div :class="$style.body">
					Bank transfers have been at the core of global payments
					since Western Union added money transfers to its telegram
					services in 1871, giving individuals the ability to move
					money across distances via an electronic communication
					network for the first time.
				</div>
			</Flex>

			<Flex align="center" gap="8" :class="$style.metadata">
				<Flex align="center" gap="8" :class="$style.author">
					<Icon name="logo_symbol" size="20" />
					Juster Team
				</Flex>

				<Icon name="dot" size="16" style="fill: var(--border)" />

				<div :class="$style.date">Feb 2, 2022</div>
			</Flex>
		</Flex>

		<Flex wrap="wrap" justify="between" :class="$style.posts">
			<Flex direction="column" :class="$style.post">
				<div :class="$style.cover" />

				<Flex direction="column" gap="8" :class="$style.content">
					<div :class="$style.category">Development</div>
					<h1>Summary of two quarters in 2022</h1>
					<div :class="$style.body">
						Bank transfers have been at the core of global payments
						since Western Union added money transfers to its
						telegram services in 1871, giving individuals the
						ability to move money across distances via an electronic
						communication network for the first time.
					</div>
				</Flex>

				<Flex align="center" gap="8" :class="$style.metadata">
					<Flex align="center" gap="8" :class="$style.author">
						<div :class="$style.avatar" />
						ztepler
					</Flex>

					<Icon name="dot" size="16" style="fill: var(--border)" />

					<div :class="$style.date">Feb 2, 2022</div>
				</Flex>
			</Flex>
			<Flex direction="column" :class="$style.post">
				<div :class="$style.cover" />

				<Flex direction="column" gap="8" :class="$style.content">
					<div :class="$style.category">Development</div>
					<h1>Summary of two quarters in 2022</h1>
					<div :class="$style.body">
						Bank transfers have been at the core of global payments
						since Western Union added money transfers to its
						telegram services in 1871, giving individuals the
						ability to move money across distances via an electronic
						communication network for the first time.
					</div>
				</Flex>

				<Flex align="center" gap="8" :class="$style.metadata">
					<Flex align="center" gap="8" :class="$style.author">
						<div :class="$style.avatar" />
						ztepler
					</Flex>

					<Icon name="dot" size="16" style="fill: var(--border)" />

					<div :class="$style.date">Feb 2, 2022</div>
				</Flex>
			</Flex>
			<Flex direction="column" :class="$style.post">
				<div :class="$style.cover" />

				<Flex direction="column" gap="8" :class="$style.content">
					<div :class="$style.category">Development</div>
					<h1>Summary of two quarters in 2022</h1>
					<div :class="$style.body">
						Bank transfers have been at the core of global payments
						since Western Union added money transfers to its
						telegram services in 1871, giving individuals the
						ability to move money across distances via an electronic
						communication network for the first time.
					</div>
				</Flex>

				<Flex align="center" gap="8" :class="$style.metadata">
					<Flex align="center" gap="8" :class="$style.author">
						<div :class="$style.avatar" />
						ztepler
					</Flex>

					<Icon name="dot" size="16" style="fill: var(--border)" />

					<div :class="$style.date">Feb 2, 2022</div>
				</Flex>
			</Flex>
			<Flex direction="column" :class="$style.post">
				<div :class="$style.cover" />

				<Flex direction="column" gap="8" :class="$style.content">
					<div :class="$style.category">Development</div>
					<h1>Summary of two quarters in 2022</h1>
					<div :class="$style.body">
						Bank transfers have been at the core of global payments
						since Western Union added money transfers to its
						telegram services in 1871, giving individuals the
						ability to move money across distances via an electronic
						communication network for the first time.
					</div>
				</Flex>

				<Flex align="center" gap="8" :class="$style.metadata">
					<Flex align="center" gap="8" :class="$style.author">
						<div :class="$style.avatar" />
						ztepler
					</Flex>

					<Icon name="dot" size="16" style="fill: var(--border)" />

					<div :class="$style.date">Feb 2, 2022</div>
				</Flex>
			</Flex>
		</Flex>

		<div :class="$style.divider" />
		<div :class="$style.subscribe">Subscribe via RSS</div>
	</div>
</template>

<style module>
.wrapper {
}

.title {
	font-size: 16px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.moon {
	fill: var(--blue);
	cursor: pointer;
}

.divider {
	width: 100%;
	height: 1px;
	background: var(--border);

	margin: 16px 0 32px 0;
}

.large_post {
	margin-bottom: 140px;
}

.post {
	max-width: 480px;

	margin-bottom: 80px;
}

.cover {
	width: 100%;
	aspect-ratio: 16/9;

	border-radius: 12px;
	background: #222222;
	box-shadow: 0px 30px 60px -30px rgba(0, 0, 0, 0.15),
		0px 50px 100px -20px rgba(0, 0, 0, 0.15);

	margin-bottom: 50px;

	transition: all 0.2s ease;
}

.cover:hover {
	box-shadow: 0 0 0 0 transparent, 0 0 0 0 transparent;
	transform: translateY(5px);
}

.post .cover {
	margin-bottom: 40px;
	box-shadow: initial;
}

.content {
	max-width: 600px;
}

.category {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--blue);
}

.large_post h1 {
	font-size: 36px;
	line-height: 1.8;
	font-weight: 600;
	color: var(--text-primary);
	text-align: center;
}

.post h1 {
	font-size: 24px;
	line-height: 1.8;
	font-weight: 600;
	color: var(--text-primary);
}

.large_post .body {
	font-size: 18px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-secondary);
	text-align: center;
}

.post .body {
	font-size: 15px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-secondary);
}

.metadata {
	margin-top: 24px;
}

.author {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
	fill: var(--brand);
}

.avatar {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: var(--border);
}

.date {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.subscribe {
	font-size: 14px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-secondary);
}
</style>