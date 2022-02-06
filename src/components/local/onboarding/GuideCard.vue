<script>
import { defineComponent, toRefs } from "vue"

export default defineComponent({
    name: "GuideCard",
    props: {
        guide: Object,
    },

    setup(props) {
        const { guide } = toRefs(props)

        const getIcon = () => {
            switch (guide.value.color) {
                case "blue":
                    return require(`@/assets/onboarding/guide_icon_1.svg`)
                case "orange":
                    return require(`@/assets/onboarding/guide_icon_2.svg`)
                case "green":
                    return require(`@/assets/onboarding/guide_icon_3.svg`)
                case "yellow":
                    return require(`@/assets/onboarding/guide_icon_4.svg`)
            }
        }

        return { getIcon }
    },
})
</script>

<template>
    <router-link :to="guide.link" :class="$style.wrapper">
        <img :src="getIcon()" :class="$style[guide.color]" />

        <div :class="$style.base">
            <div :class="$style.type">
                {{ guide.type }}
            </div>
            <div :class="$style.title">
                {{ guide.title }}
            </div>
        </div>
    </router-link>
</template>

<style module>
.wrapper {
    width: 250px;
    display: flex;
    align-items: center;
    gap: 16px;

    padding: 0 16px;
    height: 72px;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--border);

    transition: all 0.2s ease;
}

.wrapper:hover {
    box-shadow: 0 0 0 transparent;
    border: 1px solid var(--border-highlight);
}

.wrapper img {
    padding: 8px;
    border-radius: 6px;
}

.wrapper img.blue {
    background: rgba(47, 128, 237, 0.2);
}

.wrapper img.orange {
    background: rgba(242, 153, 74, 0.2);
}

.wrapper img.green {
    background: rgba(39, 174, 96, 0.2);
}

.wrapper img.yellow {
    background: rgba(242, 201, 76, 0.2);
}

.base {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.type {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}
</style>
