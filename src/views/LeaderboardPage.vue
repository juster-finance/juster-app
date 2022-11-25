<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import LeaderboardBase from "@modules/leaderboard/LeaderboardBase.vue"

export default defineComponent({
	name: "LeaderboardPage",

	components: { Page, LeaderboardBase },
})
</script>

<template>
	<Page>
		<LeaderboardBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
}
</style>
