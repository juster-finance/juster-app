<script>
import { computed, defineComponent, ref, toRefs } from "vue"

/**
 * UI
 */
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

/**
 * Services
 */
import { toClipboard } from "@/services/utils/global"

export default defineComponent({
    name: "ConnectingModal",
    props: { show: Boolean, address: String },
    emits: ["onAgree"],

    setup(props) {
        const { address } = toRefs(props)

        /** Stores */
        const notificationsStore = useNotificationsStore()

        const isAddressHovered = ref(false)

        const shortAddress = computed(() => {
            if (isAddressHovered.value) {
                return address.value
            } else {
                return `${address.value.slice(0, 3)}..${address.value.slice(
                    address.value.length - 4,
                    address.value.length,
                )}`
            }
        })

        const handleCopyAddress = () => {
            notificationsStore.create({
                notification: {
                    type: "success",
                    title: "Your address copied to clipboard",
                    description: "Use Ctrl+V to paste (200 iq hint)",
                    autoDestroy: true,
                },
            })

            toClipboard(address.value)
        }

        return {
            isAddressHovered,
            shortAddress,
            handleCopyAddress,
        }
    },

    components: {
        Modal,
        Button,
    },
})
</script>

<template>
    <Modal
        :show="show"
        width="500"
        padding="32px 32px 24px 32px"
        :closeOutside="false"
        @onClose="$emit('onClose')"
    >
        <div :class="$style.wrapper">
            <div :class="$style.sync">
                <div :class="$style.circle">
                    <img
                        :src="`https://services.tzkt.io/v1/avatars/${address}`"
                        :class="$style.avatar"
                    />
                </div>

                <div :class="$style.dots">
                    <div :class="$style.dot" />
                    <div :class="$style.dot" />
                    <div :class="$style.dot" />
                    <div :class="$style.dot" />
                    <div :class="$style.dot" />
                </div>

                <div :class="$style.circle">
                    <img src="@/assets/logo.png" />
                </div>
            </div>

            <div :class="$style.title">Connecting to Juster</div>

            <div
                @mouseenter="isAddressHovered = true"
                @mouseleave="isAddressHovered = false"
                :class="$style.description"
            >
                Signed as
                <span @click="handleCopyAddress">{{ shortAddress }}</span>
            </div>

            <div :class="$style.labels">
                <div :class="$style.label">
                    <Icon name="verified" size="16" /> We only use the
                    <div>wallet</div>
                    address
                </div>
                <div :class="[$style.label, $style.orange]">
                    <Icon name="warning" size="16" /> Notice, Hangzhou Testnet
                    used
                </div>
            </div>

            <Button size="medium" type="primary" block @click="$emit('onAgree')"
                ><Icon name="bolt" size="16" /> Agree & Continue</Button
            >

            <div :class="$style.hint">
                By processing, you agree to <span>Terms of Use</span> and
                participation in gambling is prohibited for persons under the
                age of <span>21+</span>
            </div>
        </div>
    </Modal>
</template>

<style module>
.wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sync {
    display: flex;
    align-items: center;
    gap: 32px;

    margin: 20px 0 50px 0;
}

.circle {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: #242424;
}

.circle img {
    width: 60px;
    height: 60px;
}

.dots {
    display: flex;
    align-items: center;
    gap: 12px;
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
}
.dot:nth-child(1) {
    animation: move 1.5s ease 0s infinite;
}
.dot:nth-child(2) {
    animation: move 1.5s ease 0.25s infinite;
}
.dot:nth-child(3) {
    animation: move 1.5s ease 0.5s infinite;
}
.dot:nth-child(4) {
    animation: move 1.5s ease 0.75s infinite;
}
.dot:nth-child(5) {
    animation: move 1.5s ease 1s infinite;
}

@keyframes move {
    0% {
        background: rgba(255, 255, 255, 0.1);
    }
    40% {
        background: rgba(255, 255, 255, 1);
    }
    80% {
        background: rgba(255, 255, 255, 0.1);
    }
    100% {
        background: rgba(255, 255, 255, 0.1);
    }
}

.title {
    font-size: 20px;
    line-height: 1.2;
    font-weight: 600;
    color: var(--text-primary);

    margin-bottom: 8px;
}

.description {
    font-size: 12px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-bottom: 36px;
}

.description span {
    cursor: pointer;
    color: var(--text-secondary);
}

.labels {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    margin-bottom: 40px;
}

.label {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
    fill: var(--green);
}

.label div {
    color: var(--text-secondary);
}

.label.orange {
    color: var(--orange);
    fill: var(--orange);
}

.hint {
    font-size: 12px;
    line-height: 1.6;
    font-weight: 600;
    color: var(--text-tertiary);
    text-align: center;

    max-width: 400px;

    margin-top: 16px;
}

.hint span {
    color: var(--text-secondary);
}
</style>
