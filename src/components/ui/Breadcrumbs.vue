<script>
import { defineComponent } from "vue"
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

        return {
            selectCrumb,
        }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
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
                name="arrowright"
                size="14"
                :class="$style.arrow_icon"
            />
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
}

.crumb {
    display: flex;
    align-items: center;

    font-size: 14px;
    font-weight: 600;
    color: var(--text-tertiary);

    transition: color 0.2s ease;
}

.arrow_icon {
    fill: var(--opacity-20);

    margin: 0 10px;
}

.crumb.last {
    color: var(--text-secondary);
}

.crumb:hover {
    color: var(--text-primary);
}
</style>
