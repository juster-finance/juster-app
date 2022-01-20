<script>
import { defineComponent } from "vue"

export default defineComponent({
    name: "Page",
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.content">
            <slot />
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 32px 100px 32px;
    padding-top: 40px;

    flex: 1;
}

.content {
    width: 100%;
    max-width: 1250px;
}

@media (max-width: 700px) {
    .wrapper {
        margin: 0 24px 100px 24px;
        padding-top: 24px;
    }
}
</style>
