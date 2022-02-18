<script>
import { computed, defineComponent, ref, toRefs, watch } from "vue"

/**
 * UI
 */
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"

/**
 * Tezos
 */
import { validateAddress } from "@taquito/utils"

export default defineComponent({
    name: "FindParticipantModal",
    props: { show: Boolean },
    emits: ["onAdd"],

    setup(props, context) {
        const { show } = toRefs(props)

        const address = ref("")

        const buttonState = computed(() => {
            switch (validateAddress(address.value)) {
                case 0:
                    return { text: "Invalid address format", disabled: true }

                case 1:
                    return { text: "Invalid checksum", disabled: true }

                case 2:
                    return { text: "Invalid length", disabled: true }

                case 3:
                    return { text: "Add user", disabled: false }

                default:
                    return { text: "Something went wrong", disabled: true }
            }
        })

        const handleAdd = () => {
            if (buttonState.value.disabled) return

            context.emit("onAdd", address.value)
        }

        watch(show, () => {
            if (!show.value) {
                address.value = ""
            }
        })

        return {
            show,
            address,
            buttonState,
            handleAdd,
        }
    },

    components: {
        Modal,
        Button,
        Input,
    },
})
</script>

<template>
    <Modal :show="show" width="500" closable @onClose="$emit('onClose')">
        <div :class="$style.title">Add participant</div>

        <Input
            type="text"
            v-model="address"
            label="Address"
            placeholder="Type user address"
            :class="$style.input"
        />

        <Button
            @click="handleAdd"
            :type="buttonState.disabled ? 'secondary' : 'primary'"
            size="large"
            :disabled="buttonState.disabled"
            block
            >{{ buttonState.text }}</Button
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

.input {
    margin-bottom: 24px;
}
</style>
