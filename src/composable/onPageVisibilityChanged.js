import { onBeforeUnmount } from "vue";

export const useOnPageVisibilityChanged = (callback) => {
    const handleVisibilityChange = () => {
        const isVisible = !document.hidden;
        callback(isVisible);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    onBeforeUnmount(() => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
    })
}
