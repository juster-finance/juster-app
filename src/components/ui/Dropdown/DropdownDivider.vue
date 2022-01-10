<script>
import { defineComponent } from "vue"

export default defineComponent({
    name: "DropdownDivider",
})
</script>

<template>
    <div :class="$style.wrapper" />
</template>

<style module>
.wrapper {
    width: 100%;
    height: 1px;
    background: var(--separator);
    margin: 8px 0;
}
</style>