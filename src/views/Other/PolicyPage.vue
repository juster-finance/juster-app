<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

export default defineComponent({
	name: "PolicyPage",

	components: { Page },
})
</script>

<template>
	<Page>
		<h1>Privacy Policy</h1>
		<div :class="$style.description">Updated 25 Sep 2024</div>

		<div :class="$style.block">
			<h2>Scope</h2>

			<p>
				This Privacy Policy covers the personal information we collect
				about you when you use our products or services, or otherwise
				interact with us, including on our website at www.juster.fi,
				desktop and mobile applications (“Apps”), and our related online
				and offline offerings (collectively, the “Services”). This
				policy also explains your choices surrounding how we use your
				personal information, which include how you can object to
				certain uses of the information and how you can access and
				update certain information.
			</p>
		</div>

		<div :class="$style.block">
			<h2>1. Personal Information we collect</h2>

			<p>
				This Privacy Policy covers the personal information we collect
				about you when you use our products or services, or otherwise
				interact with us, including on our website at www.juster.fi,
				desktop and mobile applications (“Apps”), and our related online
				and offline offerings (collectively, the “Services”). This
				policy also explains your choices surrounding how we use your
				personal information, which include how you can object to
				certain uses of the information and how you can access and
				update certain information.
			</p>
		</div>

		<div :class="$style.block">
			<h2>2. How we use your information</h2>

			<p>
				This Privacy Policy covers the personal information we collect
				about you when you use our products or services, or otherwise
				interact with us, including on our website at www.juster.fi,
				desktop and mobile applications (“Apps”), and our related online
				and offline offerings (collectively, the “Services”). This
				policy also explains your choices surrounding how we use your
				personal information, which include how you can object to
				certain uses of the information and how you can access and
				update certain information.
			</p>
		</div>
	</Page>
</template>

<style module>
.description {
	font-size: 14px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);

	margin: 16px 0 40px 0;
}

.block {
	margin-bottom: 40px;
}

.block h2 {
	margin-bottom: 16px;
}

.block p {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 400;
	color: var(--text-secondary);
}
</style>
