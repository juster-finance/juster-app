import { watch, onBeforeUnmount } from "vue"

export const useOnResize = (elRef, onResize) => {
    const observer = new ResizeObserver((entries) => {
        const entry = entries[0]
        onResize(entry.contentRect.width, entry.contentRect.height)
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
}
