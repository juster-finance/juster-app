<script>
import { defineComponent } from "vue"

/**
 * UI
 */
import Spin from "./Spin"

export default defineComponent({
    name: "Label",
    props: {
        icon: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            default: "gray",
        },
        loading: {
            type: Boolean,
        },
    },

    components: { Spin },
})
</script>

<template>
    <div :class="[$style.wrapper, $style[color]]">
        <Icon v-if="!loading" :name="icon" size="12" />
        <div v-else :class="$style.spin">
            <Spin size="16" />
        </div>

        <slot />
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;

    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-tertiary);
    white-space: nowrap;

    background: var(--label-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 4px 12px 4px 4px;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);
}

.wrapper span {
    color: var(--text-primary);

    margin-right: 4px;
}

.wrapper svg {
    box-sizing: content-box;
    padding: 4px;
    border-radius: 6px;

    margin-right: 8px;
}

.spin {
    padding: 2px;

    margin-right: 8px;
}

/** colors */
.wrapper.gray svg {
    fill: var(--icon);
    background: var(--opacity-10);
}
.wrapper.orange svg {
    fill: var(--orange);
    background: rgba(239, 132, 86, 0.2);
}
.wrapper.green svg {
    fill: var(--green);
    background: rgba(26, 161, 104, 0.2);
}
.wrapper.yellow svg {
    fill: var(--yellow);
    background: rgba(245, 183, 43, 0.2);
}
.wrapper.red svg {
    fill: var(--red);
    background: rgba(224, 92, 67, 0.2);
}
</style>
