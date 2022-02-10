<script>
import { defineComponent, onMounted } from "vue"
import { useMeta } from "vue-meta"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * API
 */
import { fetchReleases } from "@/api/sanity"

/**
 * Local
 */
import ReleaseCard from "./ReleaseCard"

/**
 * Store
 */
import { useReleasesStore } from "@/store/releases"

export default defineComponent({
    name: "ReleasesBase",

    setup() {
        /** Meta */
        useMeta({
            title: "Releases",
            description: "New updates and improvements to Juster.",
        })

        const releasesStore = useReleasesStore()

        onMounted(async () => {
            releasesStore.all = await fetchReleases()
        })

        return {
            releasesStore,
        }
    },

    components: {
        Button,
        ReleaseCard,
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

        <div :class="$style.base">
            <h1 :class="$style.title">Releases.</h1>
            <div :class="$style.description">
                Join our Discord or Twitter to keep up with new updates
            </div>

            <div :class="$style.buttons">
                <a href="https://discord.gg/FeGDCkHhnB" target="_blank">
                    <Button type="secondary" size="small"
                        ><Icon name="discord" size="16" />Join our Discord
                        Server</Button
                    ></a
                >
                <a href="https://twitter.com/TezosBakingBad" target="_blank">
                    <Button type="secondary" size="small"
                        ><Icon name="twitter" size="16" />Read our
                        Twitter</Button
                    >
                </a>
            </div>

            <div :class="$style.releases">
                <ReleaseCard
                    v-for="release in releasesStore.all"
                    :key="release._id"
                    :release="release"
                    :class="$style.card"
                />
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    justify-content: center;
}

.base {
    display: flex;
    flex-direction: column;
    align-items: center;

    max-width: 700px;
}

.title {
    font-size: 50px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    margin-top: 40px;
    margin-bottom: 32px;
}

.description {
    font-size: 16px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-secondary);

    margin-bottom: 20px;
}

.buttons {
    display: flex;
    align-items: center;
    gap: 8px;

    margin-bottom: 60px;
}
</style>
