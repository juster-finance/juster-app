<script>
import { computed, defineComponent, ref, toRefs, watch } from "vue"

/**
 * UI
 */
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Spin from "@/components/ui/Spin"
import Checkbox from "@/components/ui/Checkbox"

/**
 * Store
 */
import { useNotificationsStore } from "@/store/notifications"
import { useAccountStore } from "@/store/account"

/**
 * SDK
 */
import { withdrawAll } from "@/services/sdk"

export default defineComponent({
    name: "WithdrawAllModal",
    props: { show: Boolean },

    setup(props, context) {
        const { show } = toRefs(props)

        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        const awaitingConfirmation = ref(false)

        const positions = computed(() => accountStore.positionsForWithdrawal)

        const selectedPositionsIds = ref([])
        const selectedPositions = computed(() =>
            positions.value.filter((position) =>
                selectedPositionsIds.value.includes(position.id),
            ),
        )

        const isAllSelected = computed(() =>
            positions.value.every((position) =>
                selectedPositionsIds.value.includes(position.id),
            ),
        )

        const buttonState = computed(() => {
            if (!selectedPositionsIds.value.length)
                return {
                    text: "Select at least one position",
                    disabled: true,
                }

            if (awaitingConfirmation.value)
                return {
                    text: "Awaiting confirmation..",
                    disabled: true,
                }

            return {
                text: `Withdraw ${selectedPositions.value
                    .reduce((acc, curr) => acc + curr.value, 0)
                    .toFixed(2)} ꜩ`,
                disabled: false,
            }
        })

        const handleSelectPosition = (position) => {
            if (selectedPositionsIds.value.includes(position.id)) {
                selectedPositionsIds.value.splice(
                    selectedPositionsIds.value.indexOf(position.id),
                    1,
                )
            } else {
                selectedPositionsIds.value.push(position.id)
            }
        }

        const handleSelectAllPositions = () => {
            positions.value.forEach((position) => {
                selectedPositionsIds.value.push(position.id)
            })
        }
        const handleUnselectAllPositions = () => {
            selectedPositionsIds.value = []
        }

        const handleWithdrawAll = async () => {
            if (!selectedPositionsIds.value.length) return

            const selectedEventsIds = positions.value
                .filter((pos) => selectedPositionsIds.value.includes(pos.id))
                .map((pos) => pos.event.id)

            awaitingConfirmation.value = true

            const result = await withdrawAll({
                eventIds: selectedEventsIds,
                address: accountStore.pkh,
            })

            if (result.success) {
                context.emit("onClose")
                awaitingConfirmation.value = false

                notificationsStore.create({
                    notification: {
                        type: "success",
                        title: "Batch request sent",
                        description: `Wait for confirmation of the operation to continue (${result.op})`,
                        autoDestroy: true,
                    },
                })
            } else {
                awaitingConfirmation.value = false

                notificationsStore.create({
                    notification: {
                        type: "warning",
                        title: result.title,
                        description: result.message,
                        autoDestroy: true,
                    },
                })
            }
        }

        watch(show, () => {
            if (!show.value) {
                selectedPositionsIds.value = []
                awaitingConfirmation.value = false
            }
        })

        return {
            positions,
            selectedPositionsIds,
            selectedPositions,
            isAllSelected,
            awaitingConfirmation,
            handleSelectPosition,
            handleSelectAllPositions,
            handleUnselectAllPositions,
            handleWithdrawAll,
            buttonState,
        }
    },

    components: {
        Modal,
        Button,
        Spin,
        Checkbox,
    },
})
</script>

<template>
    <Modal :show="show" width="500" closable @onClose="$emit('onClose')">
        <div :class="$style.title">Withdraw all</div>
        <div :class="$style.description">
            Here you can send a batch request to withdraw all your funds
        </div>

        <div :class="$style.subtitle">
            <span>Select positions to withdraw</span>

            <span v-if="!isAllSelected" @click="handleSelectAllPositions"
                >Select all ({{
                    positions.filter((pos) => pos.value).length
                }})</span
            >
            <span v-else @click="handleUnselectAllPositions"
                >Unselect all ({{
                    positions.filter((pos) => pos.value).length
                }})</span
            >
        </div>

        <div :class="$style.positions">
            <div
                v-for="position in positions.filter((pos) => pos.value)"
                :key="position.id"
                @click="handleSelectPosition(position)"
                :class="$style.position"
            >
                <Checkbox
                    :forceChecked="selectedPositionsIds.includes(position.id)"
                />

                <div :class="$style.base">
                    <div :class="$style.name">
                        <img
                            v-if="position.event.winnerBets == 'ABOVE_EQ'"
                            :src="require('@/assets/icons/higher_won.svg')"
                            alt="won_side_icon"
                        />
                        <img
                            v-else
                            :src="require('@/assets/icons/lower_won.svg')"
                            alt="won_side_icon"
                        />
                        <span>Tezos / Dollar</span> price event
                    </div>
                    <div :class="$style.subname">
                        Event ID: {{ position.event.id }}, Amount:&nbsp;<span>{{
                            position.value.toFixed(2)
                        }}</span
                        >&nbsp;ꜩ
                    </div>
                </div>
            </div>
        </div>

        <div :class="$style.hint">
            Please note that a response about successful withdrawal will come
            when all operations are completed (this may take some time).
            <a
                href="https://juster.notion.site/Withdraw-all-funds-77d8592c238947b497a54f8f3617feb3"
                target="_blank"
                >Learn more</a
            >
        </div>

        <Button
            @click="handleWithdrawAll"
            :type="buttonState.disabled ? 'secondary' : 'success'"
            size="large"
            :disabled="buttonState.disabled"
            :loading="awaitingConfirmation"
            block
            ><Icon v-if="!awaitingConfirmation" name="crown" size="16" />
            <Spin v-else size="16" />{{ buttonState.text }}</Button
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

    margin-bottom: 16px;
}

.description {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 600;
    color: var(--text-tertiary);

    margin-bottom: 32px;
}

.subtitle {
    display: flex;
    justify-content: space-between;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-secondary);

    margin-bottom: 16px;
}

.subtitle span:nth-child(2) {
    color: var(--text-blue);
    cursor: pointer;
}

.positions {
    display: flex;
    flex-direction: column;
    gap: 8px;

    max-height: 340px;
    overflow-y: auto;
}

.position {
    display: flex;
    gap: 14px;

    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 16px;
}

.base {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.name {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.name img {
    width: 16px;
    height: 16px;
}

.name span {
    color: var(--text-primary);
}

.subname {
    display: flex;

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.subname span {
    color: var(--text-primary);
}

.hint {
    font-size: 12px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    margin: 8px 0 32px 0;
}

.hint a {
    color: var(--text-blue);
}
</style>
