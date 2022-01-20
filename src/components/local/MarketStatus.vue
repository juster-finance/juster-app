<script>
import { defineComponent, ref, watch, nextTick } from "vue"

/**
 * Composable
 */
import { useOnOutsidePress } from "@/composable/onOutside"

export default defineComponent({
    name: "MarketStatus",

    setup() {
        const popup = ref(null)

        const isOpen = ref(false)

        const openPopup = (e) => {
            e.stopPropagation()

            isOpen.value = !isOpen.value
        }

        const close = () => {
            isOpen.value = false
        }

        let removeOutside
        watch(isOpen, () => {
            if (isOpen.value) {
                document.addEventListener("keydown", onKeydown)

                nextTick(() => {
                    removeOutside = useOnOutsidePress(popup, close)
                })
            } else {
                removeOutside()
                document.removeEventListener("keydown", onKeydown)
            }
        })

        const onKeydown = (event) => {
            if (event.key == "Escape") close()
        }

        return { popup, isOpen, openPopup }
    },
})
</script>

<template>
    <div @click="openPopup" :class="$style.wrapper">
        <div :class="$style.left">
            <div :class="$style.circle" />
        </div>

        <div :class="$style.right">
            <Icon name="bolt" size="10" />
        </div>

        <transition name="popup">
            <div v-if="isOpen" ref="popup" :class="$style.popup">
                <div :class="$style.block">
                    <div :class="[$style.block_icon, $style.green]">
                        <div :class="$style.circle" />
                    </div>

                    <div :class="$style.block_base">
                        <div :class="$style.title">Market open</div>

                        <div :class="$style.description">
                            This is a great time to place a bet or provide
                            liquidity.
                        </div>
                    </div>
                </div>

                <div :class="$style.divider" />

                <div :class="$style.block">
                    <div :class="[$style.block_icon, $style.orange]">
                        <Icon name="bolt" size="10" />
                    </div>

                    <div :class="$style.block_base">
                        <div :class="$style.title">One update per minute</div>

                        <div :class="$style.description">
                            At the moment, we update quotes once every minute.
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;

    position: relative;

    border-radius: 50px;
}

.left,
.right {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 18px;
}

.left {
    background: rgba(26, 161, 104, 0.15);
    border-radius: 50px 0 0 50px;
}

.right {
    display: flex;
    background: rgba(239, 132, 86, 0.15);
    border-radius: 0 50px 50px 0;
}

.right svg {
    fill: var(--orange);
}

.circle {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
}

.popup {
    position: absolute;

    top: 26px;
    left: 0;

    z-index: 1;
    width: 280px;
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 16px 0 14px 0;
    background: var(--card-bg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.block {
    display: flex;
    gap: 12px;

    padding: 0 14px;
}

.block_icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    min-width: 16px;
    height: 16px;
}

.block_icon.green {
    background: rgba(26, 161, 104, 0.15);
}

.block_icon.orange {
    background: rgba(239, 132, 86, 0.15);
}

.block_icon svg {
    fill: var(--orange);
}

.title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    margin-bottom: 6px;
}

.description {
    font-size: 13px;
    line-height: 1.6;
    font-weight: 400;
    color: var(--text-tertiary);
}

.divider {
    width: 100%;
    height: 1px;
    background: var(--border);

    margin: 14px 0;
}
</style>
