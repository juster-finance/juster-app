<script>
import { defineComponent, ref, reactive, watch, nextTick, toRefs } from "vue"

/**
 * Composable
 */
import { useOnOutsidePress } from "@/composable/onOutside"

export default defineComponent({
    name: "Dropdown",
    props: {
        forceOpen: Boolean,
        side: {
            type: String,
            default: "bottom",
        },
    },
    emits: ["onClose"],

    setup(props, context) {
        const { side, forceOpen } = toRefs(props)

        const trigger = ref(null)
        const dropdown = ref(null)
        const isOpen = ref(false)

        watch(forceOpen, () => {
            isOpen.value = forceOpen.value
        })

        const toggleDropdown = (event) => {
            event.stopPropagation()

            isOpen.value = !isOpen.value
        }
        const close = (event) => {
            if (event) event.stopPropagation()

            isOpen.value = false

            context.emit("onClose")
        }

        const dropdownStyles = reactive({
            top: `initial`,
            right: 0,
            bottom: `initial`,
        })

        let removeOutside
        watch(isOpen, () => {
            if (!isOpen.value) {
                removeOutside()

                document.removeEventListener("keydown", onKeydown)
            } else {
                document.addEventListener("keydown", onKeydown)

                const triggerHeight =
                    trigger.value.getBoundingClientRect().height

                if (side.value == "bottom") {
                    dropdownStyles.top = `${triggerHeight + 6}px`
                }
                if (side.value == "top") {
                    dropdownStyles.bottom = `${triggerHeight + 6}px`
                }

                nextTick(() => {
                    removeOutside = useOnOutsidePress(dropdown, close)
                })
            }
        })

        const onKeydown = (event) => {
            if (event.key == "Escape") close()
        }

        return {
            trigger,
            dropdown,
            isOpen,
            toggleDropdown,
            close,
            dropdownStyles,
        }
    },
})
</script>

<template>
    <div ref="dropdown" :class="$style.wrapper">
        <div ref="trigger" @click="toggleDropdown" :class="$style.trigger">
            <slot name="trigger" />
        </div>

        <transition name="popup">
            <div
                v-if="isOpen"
                @click="close"
                :class="$style.dropdown"
                :style="dropdownStyles"
            >
                <slot name="dropdown" />
            </div>
        </transition>
    </div>
</template>

<style module>
.wrapper {
    position: relative;
}

.trigger {
    cursor: pointer;
}

.dropdown {
    position: absolute;

    z-index: 1000;
    padding: 8px 0;
    border-radius: 8px;
    background: var(--dropdown-bg);
}
</style>
