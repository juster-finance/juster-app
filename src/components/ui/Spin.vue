<script>
import { defineComponent, toRefs, computed } from "vue"

export default defineComponent({
    name: "Spin",
    props: {
        size: String,
    },

    setup(props) {
        const { size } = toRefs(props)

        const calcStyles = computed(() => {
            return {
                height: `${size.value}px`,
                minHeight: `${size.value}px`,
                width: `${size.value}px`,
                minWidth: `${size.value}px`,
            }
        })

        return { calcStyles }
    },
})
</script>

<template>
    <div :class="$style.wrapper" :style="calcStyles" />
</template>

<style module>
.wrapper {
    border-radius: 100px;
    border: 2px rgba(255, 255, 255, 0.1) solid;
    border-top: 2px rgba(255, 255, 255, 1) solid;
    animation: material-spinner 4s infinite;
}

@keyframes material-spinner {
    0% {
        transform: rotate(0deg);
    }
    25% {
        transform: rotate(360deg);
    }
    50% {
        transform: rotate(720deg);
    }
    75% {
        transform: rotate(1080deg);
    }
    100% {
        transform: rotate(1440deg);
    }
}
</style>
