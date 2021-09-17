<script>
import { defineComponent, ref, reactive, watch, nextTick } from "vue"

/**
 * Composable
 */
import { useOnOutsidePress } from "@/composable/onOutside"

export default defineComponent({
    name: "Dropdown",

    setup() {
        const trigger = ref(null)
        const dropdown = ref(null)
        const isOpen = ref(false)

        const toggleDropdown = event => {
            event.stopPropagation()

            isOpen.value = !isOpen.value
        }
        const close = event => {
            event.stopPropagation()

            isOpen.value = false
        }

        const dropdownStyles = reactive({
            top: 0,
            right: 0,
        })

        let removeOutside
        watch(isOpen, () => {
            if (!isOpen.value) {
                removeOutside()
            } else {
                const triggerHeight = trigger.value.getBoundingClientRect()
                    .height

                dropdownStyles.top = `${triggerHeight + 6}px`

                nextTick(() => {
                    removeOutside = useOnOutsidePress(dropdown, close)
                })
            }
        })

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

    z-index: 10;
    padding: 8px 0;
    border-radius: 8px;
    background: var(--card-bg);
    border: 1px solid var(--border);
}
</style>
