<script>
import { defineComponent, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"

export default defineComponent({
    name: "Breadcrumbs",
    props: {
        crumbs: Array,
    },

    setup() {
        const router = useRouter()

        const selectCrumb = crumb => {
            router.push(crumb.path)
        }

        const go = target => {
            if (!canGo(target)) return
            router.go(target == "back" ? -1 : 1)
        }
        const canGo = target => {
            return !!window.history.state[target]
        }

        const handleNavigationShortcut = event => {
            if (event.ctrlKey && event.key === "ArrowLeft") {
                event.preventDefault()
                go("back")
            }
            if (event.ctrlKey && event.key === "ArrowRight") {
                event.preventDefault()
                go("forward")
            }
        }

        onMounted(() => {
            document.addEventListener("keydown", handleNavigationShortcut)
        })

        onUnmounted(() => {
            document.removeEventListener("keydown", handleNavigationShortcut)
        })

        return {
            selectCrumb,
            go,
            canGo,
        }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.navigation">
            <div
                @click="go('back')"
                :class="[
                    $style.go_btn,
                    $style.back,
                    canGo('back') && $style.active,
                ]"
            >
                <Icon name="arrowright" size="12" />
            </div>
            <div :class="$style.divider" />
            <div
                @click="go('forward')"
                :class="[
                    $style.go_btn,
                    $style.forward,
                    canGo('forward') && $style.active,
                ]"
            >
                <Icon name="arrowright" size="12" />
            </div>
        </div>

        <div :class="$style.crumbs">
            <div
                v-for="(crumb, index) in crumbs"
                :key="crumb.name"
                @click="selectCrumb(crumb)"
                :class="[
                    $style.crumb,
                    index == crumbs.length - 1 && index != 0 && $style.last,
                ]"
            >
                {{ crumb.name }}

                <Icon
                    v-if="index !== crumbs.length - 1"
                    name="arrow"
                    size="14"
                />
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    height: 28px;
    border-radius: 6px;
    background: var(--card-bg);
    border: 1px solid var(--border);
}

.navigation .divider {
    width: 1px;
    height: 16px;
    background: var(--border);
}

.go_btn {
    width: 28px;
    height: 28px;

    fill: var(--text-tertiary);

    display: flex;
    align-items: center;
    justify-content: center;
}

.go_btn.active {
    fill: var(--text-primary);
}

.go_btn.back {
    transform: rotate(180deg);
}

.crumbs {
    display: flex;
    align-items: center;

    height: 28px;
    padding: 0 8px;
    border-radius: 6px;
    background: var(--card-bg);
    border: 1px solid var(--border);
}

.crumb {
    display: flex;
    align-items: center;

    font-size: 13px;
    font-weight: 600;
    color: var(--text-tertiary);

    height: 28px;

    transition: color 0.2s ease;
}

.crumb.last {
    color: var(--text-secondary);
}

.crumb:hover {
    color: var(--text-primary);
}

.crumb svg {
    transform: rotate(-90deg);
    fill: var(--text-tertiary);
    margin: 0 10px;
}
</style>
