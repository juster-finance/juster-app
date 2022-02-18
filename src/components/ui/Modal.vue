<script>
import {
    defineComponent,
    nextTick,
    onBeforeMount,
    onBeforeUnmount,
    computed,
    ref,
    watch,
    toRefs,
} from "vue"

/**
 * Composable
 */
import { useOnOutsidePress } from "@/composable/onOutside"

export default defineComponent({
    name: "Modal",
    props: {
        show: {
            type: Boolean,
        },
        width: {
            type: String,
        },
        closable: {
            type: Boolean,
        },
        closeOutside: {
            type: Boolean,
            default: true,
        },
    },
    emits: ["onClose"],

    setup(props, context) {
        let removeOutside
        const modal = ref(null)

        const { width, show, closeOutside } = toRefs(props)

        watch(show, () => {
            if (!show.value) {
                if (removeOutside) removeOutside()
            } else {
                if (!closeOutside.value) return

                nextTick(() => {
                    removeOutside = useOnOutsidePress(modal, handleClose)
                })
            }
        })

        onBeforeMount(() => {
            document.addEventListener("keydown", onKeydown)
        })

        onBeforeUnmount(() => {
            document.removeEventListener("keydown", onKeydown)
        })

        const calcModalStyles = computed(() => {
            const styles = {
                width: width.value ? `${width.value}px` : `400px`,
            }

            return styles
        })

        const handleClose = () => {
            context.emit("onClose")
        }

        const onKeydown = (event) => {
            if (event.key == "Escape" && show.value) handleClose()
        }

        return { modal, calcModalStyles, handleClose, onKeydown }
    },
})
</script>

<template>
    <teleport to="#modal">
        <transition name="popup">
            <div v-if="show" :class="$style.wrapper">
                <div ref="modal" :class="$style.modal" :style="calcModalStyles">
                    <slot />

                    <Icon
                        name="close"
                        size="16"
                        @click="handleClose"
                        v-if="closable"
                        :class="$style.close_icon"
                    />
                </div>
            </div>
        </transition>
    </teleport>
</template>

<style module>
.wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    backdrop-filter: blur(3px);
    background: rgba(0, 0, 0, 0.2);

    z-index: 1001;
}

.modal {
    position: relative;

    border-radius: 8px;
    background: var(--card-bg);
    box-shadow: rgb(0 0 0 / 20%) 0px 0px 1px, rgb(0 0 0 / 20%) 0px 20px 40px;
    border: 1px solid var(--border);

    padding: 32px 32px 24px 32px;
    margin: 0 20px;
}

.close_icon {
    position: absolute;
    top: 32px;
    right: 32px;

    fill: var(--icon);
    background: transparent;
    box-sizing: content-box;
    border-radius: 5px;
    padding: 4px;

    transition: fill 0.2s ease, background 0.2s ease;
}

.close_icon:hover {
    background: rgba(255, 255, 255, 0.1);
}
</style>
