import { ref, isRef, watch } from "vue"

const events = ["mousedown", "touchstart"]

export function useOnOutsidePress(el, onOutsidePressCallback) {
    const element = isRef(el) ? el : ref(el)

    const handler = e =>
        element.value &&
        !element.value.contains(e.target) &&
        onOutsidePressCallback(e)

    const event = events.find(x => `on${x}`)
    return useEvent(document, event, handler, { passive: true })
}

export function useEvent(el, name, listener, options) {
    let remove = () => {}

    if (el) {
        const element = isRef(el) ? el : ref(el)

        const removeEventListener = e => e.removeEventListener(name, listener)
        const addEventListener = e =>
            e.addEventListener(name, listener, options)

        const removeWatch = watch(
            element,
            (n, _, cleanUp) => {
                if (n) {
                    addEventListener(n)
                    cleanUp(() => removeEventListener(n))
                }
            },
            { immediate: true },
        )

        remove = () => {
            removeEventListener(element.value)
            removeWatch()
        }
    }

    return remove
}
