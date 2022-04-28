<script setup>
/**
 * UI
 */
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"

const props = defineProps({ show: { type: Boolean } })
</script>

<template>
    <Modal :show="show" width="500" closable @onClose="$emit('onClose')">
        <div :class="$style.title">Operation</div>

        <Button type="secondary" size="small" block
            ><Icon name="open" size="16" /> View operation on TzKT</Button
        >
    </Modal>
</template>

<style module>
.wrapper {
}

.title {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--text-primary);

    margin-bottom: 24px;
}
</style>
