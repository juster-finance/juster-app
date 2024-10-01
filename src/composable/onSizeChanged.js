import { watch, onBeforeUnmount, ref } from "vue"

export const useOnSizeChanged = (elRef) => {
    const width = ref(null)
    const height = ref(null)

    const observer = new ResizeObserver((entries) => {
        const entry = entries[0]
        width.value = entry.contentRect.width
        height.value = entry.contentRect.height
    })

    watch(elRef, () => {
        if (elRef.value) {
            observer.disconnect()
            observer.observe(elRef.value)
        }
    })

    onBeforeUnmount(() => {
        observer.disconnect()
    })

    return { width, height }
}
