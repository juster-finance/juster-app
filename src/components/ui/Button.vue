<script>
import { defineComponent, toRefs, computed, useCssModule } from "vue"

export default defineComponent({
    name: "Button",
    props: {
        size: {
            type: String,
            default: "medium",
        },
        type: {
            type: String,
            default: "primary",
        },
        block: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
        },
        loading: {
            type: Boolean,
        },
        icon: {
            type: String,
        },
    },

    setup(props, context) {
        const style = useCssModule()
        const { type, size, block, disabled, icon } = toRefs(props)

        const hasSlot = computed(() => !!context.slots.default)

        const getStyles = () => {
            const hasCorrectSize = [
                "large",
                "medium",
                "small",
                "mini",
            ].includes(size.value)

            return [
                style.wrapper,
                style[type.value],
                block.value && style.block,
                hasCorrectSize && style[size.value],
                disabled.value && style.disabled,
                icon.value && style.icon,
            ]
        }

        return { getStyles, hasSlot }
    },
})
</script>

<template>
    <button :class="[...getStyles(), loading && $style.loading]">
        <slot v-if="!icon" />
        <Icon v-else :name="icon" size="16" />
    </button>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    border-radius: 7px;

    color: var(--text-primary);
    font-weight: 600;

    transition: all 0.2s ease;
}

.wrapper span {
    color: var(--text-tertiary);
}

.wrapper.loading {
    opacity: 0.5;
    pointer-events: none;
}

.wrapper.block {
    width: 100%;
    justify-content: center;
}

/** SIZES */
.wrapper.large {
    height: 44px;
    font-size: 14px;
}
.wrapper.large.icon {
    padding: 0 14px;
}

.wrapper.medium {
    height: 36px;
    padding: 0 12px;
    font-size: 14px;
}
.wrapper.medium.icon {
    padding: 0 12px;
}

.wrapper.small {
    height: 30px;
    padding: 0 10px 0 10px;
    font-size: 13px;
}
.wrapper.small.icon {
    padding: 0 10px;
}

.wrapper.mini {
    height: 26px;
    padding: 0 10px 0 10px;
    font-size: 12px;
    border-radius: 6px;
}
.wrapper.mini.icon {
    padding: 0 10px;
}

.wrapper:active {
    transform: translateY(1px);
}

/** TYPES */
.wrapper.success {
    background: var(--btn-success-bg);
    fill: var(--text-black);
    color: var(--text-black);
}
.wrapper.success:hover {
    background: var(--btn-success-bg-hover);
}

.wrapper.primary {
    background: var(--btn-primary-bg);
    fill: var(--text-primary);
}
.wrapper.primary:hover {
    background: var(--btn-primary-bg-hover);
}

.wrapper.secondary {
    background: var(--btn-secondary-bg);
    border: 1px solid var(--border);
    fill: var(--text-tertiary);
}
.wrapper.secondary:hover {
    background: var(--btn-secondary-bg-hover);
}

.wrapper.tertiary {
    background: transparent;
    border: 1px solid var(--border);
    fill: var(--text-tertiary);
}
.wrapper.tertiary:hover {
    background: var(--btn-secondary-bg-hover);
}

/** OTHER */
.wrapper.disabled {
    opacity: 0.5;
    pointer-events: none;
}
</style>
