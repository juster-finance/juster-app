<script>
import { defineComponent, reactive, onMounted, toRefs, ref } from "vue"

export default defineComponent({
    name: "Tooltip",
    props: {
        width: {
            type: String,
        },
        side: { type: String },
        position: { type: String },
        textAlign: { type: String, default: "center" },
    },

    setup(props) {
        const { width, side, position } = toRefs(props)

        const trigger = ref(null)
        const tip = ref(null)

        const styles = reactive({
            left: "initial",
            right: "initial",
            top: "initial",
            bottom: "initial",
        })

        onMounted(() => {
            const tipRect = tip.value.getBoundingClientRect()
            const triggerRect = trigger.value.getBoundingClientRect()

            /** todo: refactor -> left / right / top / bottom + auto-positioning */
            if (position.value == "top") {
                styles.bottom = `${triggerRect.height + 8}px`
            } else if (position.value == "bottom" && side.value == "left") {
                styles.left = 0
                styles.top = `${triggerRect.height + 8}px`
            } else if (position.value == "bottom" && side.value == "left") {
                styles.right = 0
                styles.top = `${triggerRect.height + 8}px`
            } else {
                if (!side.value) {
                    styles.left = `-${
                        tipRect.width / 2 - triggerRect.width / 2
                    }px`
                } else if (side.value == "left") {
                    styles.left = `0px`
                } else if (side.value == "right") {
                    styles.right = `0px`
                }

                if (width.value) styles.width = `${width.value}px`

                styles.top = `${triggerRect.height + 8}px`
            }
        })

        return { styles, trigger, tip }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div ref="trigger" :class="$style.trigger">
            <slot />
        </div>

        <div ref="tip" :class="[$style.content]" :style="styles">
            <div :class="[$style.text]" :style="{ textAlign }">
                <slot name="content" />
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    position: relative;
}

.trigger {
    display: flex;
    width: 100%;
}

.content {
    z-index: 1000;
    width: max-content;
    visibility: hidden;
    opacity: 0;
    position: absolute;
    transform: scale(0.95);
    padding: 8px 10px;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 8px;
    backdrop-filter: blur(5px);

    transition: all 0.15s ease;
}

.wrapper:hover .content {
    visibility: visible;
    opacity: 1;
    transform: scale(1);
}

.text {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
}

.text span {
    font-weight: 500;
    color: var(--text-secondary);
}
</style>
