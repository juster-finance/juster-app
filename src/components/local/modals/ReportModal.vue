<script>
import {
    computed,
    defineComponent,
    reactive,
    ref,
    toRefs,
    inject,
    watch,
    onMounted,
} from "vue"
import { getFunctions, httpsCallable } from "firebase/functions"

/**
 * UI
 */
import Modal from "@/components/ui/Modal"
import Badge from "@/components/ui/Badge"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

export default defineComponent({
    name: "ReportModal",
    props: { show: Boolean, event: Object, countdownStatus: String },

    setup(props, context) {
        const { event, show } = toRefs(props)

        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        const hasSendedReport = ref(false)

        onMounted(() => {
            if (!sessionStorage.reportedEvents) return

            const reportedEvents = JSON.parse(sessionStorage.reportedEvents)
            hasSendedReport.value = reportedEvents.some(
                (eventId) => eventId == event.value.id,
            )
        })

        const problems = reactive([
            {
                name: "Invalid data or parameters",
                description:
                    "The event contains a suspicious period, invalid timer, or other errors",
            },
            {
                name: "Incorrect odds or reward calculation",
                description:
                    "In the Bet modal, the winnings are incorrectly calculated or the event has incorrect ods (for a pool up or down)",
            },
            {
                name: `Incorrect result of the event ${
                    event.value.status !== "FINISHED"
                        ? `(The event is not over yet)`
                        : ``
                }`,
                description:
                    "The outcome of the event is determined incorrectly and must be opposed to the current outcome",
                isDisabled: event.value.status !== "FINISHED",
            },
            {
                name: "There was another problem",
                description:
                    "In this case, you need to fill in the field below and describe the problem manually in as much detail as possible",
            },
        ])
        const selectedProblem = ref(null)

        const additionalInformation = reactive({
            value: "",
            error: "",
        })

        const buttonState = computed(() => {
            if (selectedProblem.value == null)
                return {
                    text: "Select a problem for this event",
                    description:
                        "Select at least one problem that occurred with the current event. We will try to fix it as soon as possible.",
                    disabled: true,
                }

            if (selectedProblem.value == 3 && !additionalInformation.value) {
                return {
                    text: "Additional information required",
                    description:
                        "Fill in the appeared field above with more detailed details so that we can correct the error or help you",
                    disabled: true,
                }
            }

            if (!accountStore.pkh)
                return {
                    text: "Sign in to send report",
                    description:
                        "If your report is the first to notify us of a broken event, we will send a reward to your address",
                    disabled: true,
                }

            if (hasSendedReport.value)
                return {
                    text: "Can`t send report",
                    description:
                        "Looks like you've already sent us a report. Try not to do this too often",
                    disabled: true,
                }

            return {
                text: "Send report",
                description: "Thans for your help!",
                disabled: false,
            }
        })

        const handleSelectProblem = (index) => {
            if (problems[index].isDisabled) return

            if (
                selectedProblem.value !== null &&
                index == selectedProblem.value
            ) {
                selectedProblem.value = null
                return
            }

            selectedProblem.value = index
        }

        /**
         * Feedback handler
         */
        const firebaseApp = inject("firebaseApp")

        const functions = getFunctions(firebaseApp)
        const sendFeedback = httpsCallable(functions, "feedback")

        const handleSendReport = () => {
            sendFeedback({
                address: accountStore.pkh,
                eventId: event.value.id,
                problem: problems[selectedProblem.value].name,
                description: additionalInformation.value,
            })
                .then(() => {
                    notificationsStore.create({
                        notification: {
                            type: "success",
                            title: "Report sent successfully",
                            description:
                                "We have received your report and will review it shortly",
                            autoDestroy: true,
                        },
                    })
                })
                .catch(() => {
                    notificationsStore.create({
                        notification: {
                            type: "error",
                            title: "Report not sent",
                            description:
                                "Something went wrong, please try again later. If the error persists, write to us on the Discord server",
                            autoDestroy: true,
                        },
                    })
                })

            selectedProblem.value = null
            additionalInformation.value = ""

            const reportedEvents = sessionStorage.reportedEvents
                ? sessionStorage.reportedEvents
                : []
            sessionStorage.reportedEvents = JSON.stringify([
                ...reportedEvents,
                event.value.id,
            ])

            context.emit("onClose")
        }

        watch(show, () => {
            if (!show.value) {
                selectedProblem.value = null
                additionalInformation.value = ""
            }
        })

        return {
            problems,
            selectedProblem,
            additionalInformation,
            buttonState,
            handleSelectProblem,
            handleSendReport,
        }
    },

    components: {
        Modal,
        Badge,
        Input,
        Button,
    },
})
</script>

<template>
    <Modal
        :show="show"
        width="500"
        padding="32px 32px 24px 32px"
        closable
        @onClose="$emit('onClose')"
    >
        <div :class="$style.title">Report the Event</div>

        <div :class="$style.event_preview">
            <div :class="$style.event_name">
                Price Event <span>#{{ event.id }}</span>
            </div>

            <div :class="$style.right">
                <Badge
                    v-if="
                        countdownStatus == 'In progress' &&
                        event.status == 'NEW'
                    "
                    color="green"
                    :class="$style.main_badge"
                    ><Icon name="bolt" size="12" />New</Badge
                >
                <Badge
                    v-else-if="
                        countdownStatus == 'Finished' && event.status == 'NEW'
                    "
                    color="yellow"
                    :class="$style.main_badge"
                    ><Icon name="bolt" size="12" />Starting soon</Badge
                >
                <Badge
                    v-else-if="event.status == 'STARTED'"
                    color="yellow"
                    :class="$style.main_badge"
                    ><Icon name="bolt" size="12" />Active</Badge
                >
                <Badge
                    v-else-if="event.status == 'FINISHED'"
                    color="gray"
                    :class="$style.main_badge"
                    ><Icon name="bolt" size="12" />Finished</Badge
                >

                <Badge color="gray" :class="$style.badge"
                    ><Icon name="infinite" size="12"
                /></Badge>
            </div>
        </div>

        <div :class="$style.hint">
            If you think this event contains an error, ended with an incorrect
            outcome, or has any other problem, fill out the form below
        </div>

        <div :class="$style.subtitle">What's wrong with this event?</div>

        <div :class="$style.problems">
            <div
                v-for="(problem, index) in problems"
                :key="index"
                @click="handleSelectProblem(index)"
                :class="[
                    $style.problem,
                    selectedProblem !== index &&
                        selectedProblem !== null &&
                        $style.opacity,
                    problem.isDisabled && $style.disabled,
                ]"
            >
                <!-- todo: Radio component -->
                <div
                    :class="[
                        $style.radio,
                        selectedProblem == index && $style.selected,
                    ]"
                />

                <div :class="$style.info">
                    <div>{{ problem.name }}</div>
                    <div>{{ problem.description }}</div>
                </div>
            </div>
        </div>

        <Input
            v-if="selectedProblem == 3"
            label="Additional information"
            placeholder="Describe the problem in more detail"
            v-model="additionalInformation.value"
            :error="additionalInformation.error"
            @clearError="additionalInformation.error = ''"
            :class="$style.input_field"
        />

        <Button
            @click="handleSendReport"
            :type="buttonState.disabled ? 'secondary' : 'primary'"
            size="large"
            block
            :disabled="buttonState.disabled"
            >{{ buttonState.text }}</Button
        >

        <div :class="$style.description">
            {{ buttonState.description }}
        </div>
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

.event_preview {
    height: 42px;
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 0 16px;

    display: flex;
    align-items: center;
    justify-content: space-between;
}

.event_name {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.event_name span {
    color: var(--text-tertiary);
}

.right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.hint {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.6;
    color: var(--text-tertiary);

    margin-top: 8px;
    margin-bottom: 32px;
}

.description {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.6;
    color: var(--text-tertiary);
    text-align: center;

    margin-top: 8px;
}

.subtitle {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-secondary);

    margin-bottom: 20px;
}

.problems {
    display: flex;
    flex-direction: column;
    gap: 16px;

    margin-bottom: 32px;
}

.problem {
    display: flex;
    gap: 14px;

    transition: opacity 0.2s ease;
}

.problem.opacity {
    opacity: 0.4;
}

.problem.disabled {
    opacity: 0.4;
    pointer-events: none;
}

.problem:hover {
    opacity: 1;
}

.problem:hover .radio {
    border: 2px solid var(--opacity-20);
}

.radio {
    min-width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid var(--opacity-10);
    background: transparent;

    transition: all 0.2s ease;
}

.radio.selected {
    border: 2px solid var(--blue) !important;
}

.problem .info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.problem .info div:nth-child(1) {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.problem .info div:nth-child(2) {
    font-size: 12px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);
}

.input_field {
    margin-bottom: 32px;
}
</style>
