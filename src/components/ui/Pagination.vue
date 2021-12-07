<script>
import { computed, defineComponent, ref, toRefs } from "vue"

/**
 * UI
 */
import Button from "@/components/ui/Button"

export default defineComponent({
    name: "Pagination",
    props: {
        total: {
            type: Number,
            required: true,
        },
        limit: {
            type: Number,
            required: true,
        },
        modelValue: Number,
    },

    setup(props, context) {
        const { total, limit, modelValue } = toRefs(props)

        const pages = computed(() => Math.round(total.value / limit.value))

        const selectPage = (page) => {
            context.emit("update:modelValue", page)
        }

        const nextPage = () => {
            if (modelValue.value == pages.length) return

            context.emit("update:modelValue", modelValue.value + 1)
        }

        const prevPage = () => {
            if (modelValue.value == 1) return

            context.emit("update:modelValue", modelValue.value - 1)
        }

        return {
            pages,
            currentPage: modelValue,
            selectPage,
            nextPage,
            prevPage,
        }
    },

    components: { Button },
})
</script>

<template>
    <div :class="$style.wrapper">
        <Button
            @click="prevPage"
            type="tertiary"
            size="small"
            icon="arrow"
            :class="[$style.arrow_btn, $style.left]"
            :disabled="currentPage == 1"
        />

        <Button
            v-for="page in 3"
            :key="page"
            @click="selectPage(page)"
            type="tertiary"
            size="small"
            :class="[$style.page, currentPage == page && $style.current]"
            >{{ page }}</Button
        >

        <Button
            @click="nextPage"
            type="tertiary"
            size="small"
            icon="arrow"
            :class="[$style.arrow_btn, $style.right]"
            :disabled="currentPage == pages"
        />
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page {
    color: var(--text-tertiary);
}

.page.current {
    color: var(--text-primary);
}

.arrow_btn {
    fill: var(--text-primary) !important;
}

.arrow_btn.left svg {
    transform: rotate(90deg);
}

.arrow_btn.right svg {
    transform: rotate(-90deg);
}
</style>
