<script>
import { defineComponent, ref, onMounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useMeta } from "vue-meta"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"

/**
 * Local
 */
import EventCard from "@/components/local/EventCard"

/**
 * Services
 */
import { juster, fetchBalance } from "@/services/tools"
import { toClipboard } from "@/services/utils/global"

/**
 * API
 */
import { fetchUser } from "@/api/users"
import { fetchAllUserPositions } from "@/api/positions"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

export default defineComponent({
    name: "ProfileBase",

    setup() {
        const router = useRouter()

        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        const isMyProfile = computed(
            () => !router.currentRoute.value.params.address,
        )

        const user = ref(null)
        const balance = ref(0)
        const address = computed(() =>
            isMyProfile.value
                ? accountStore.pkh
                : router.currentRoute.value.params.address,
        )

        const events = ref([])
        const positions = ref([])

        /** Balance */
        const getUserBalance = async () => {
            balance.value = await fetchBalance(address.value)
        }

        if (!isMyProfile.value) {
            getUserBalance()
        } else {
            accountStore.updateBalance()
        }

        const isProfileLoaded = ref(false)

        const getUserData = async () => {
            user.value = await fetchUser({ address: address.value })

            isProfileLoaded.value = true

            positions.value = await fetchAllUserPositions({
                address: address.value,
            })
            events.value = positions.value.map(position => position.event)
        }

        onMounted(() => {
            if (
                address.value.length !== 36 ||
                (!isMyProfile.value && accountStore.pkh == address.value)
            ) {
                router.push("/profile")
                return
            }

            getUserData()
        })

        watch(router.currentRoute, () => {
            getUserData()
        })

        const handleLogout = () => {
            juster._provider.client.clearActiveAccount().then(async () => {
                await juster._provider.client.getActiveAccount()
                accountStore.setPkh("")
                router.push("/")

                notificationsStore.create({
                    notification: {
                        type: "success",
                        title: "You are signed out",
                        description:
                            "To work with the application, you definitely need an account :)",
                        autoDestroy: true,
                    },
                })
            })
        }

        const handleCopyAddress = () => {
            toClipboard(address.value)

            notificationsStore.create({
                notification: {
                    type: "success",
                    title: "Copied to clipboard",
                    description: "You have copied the user's address",
                    autoDestroy: true,
                },
            })
        }

        const handleBack = () => {
            router.back()
        }

        /** Meta */
        const { meta } = useMeta({
            title: `My profile`,
        })

        return {
            handleLogout,
            handleCopyAddress,
            handleBack,
            isProfileLoaded,
            accountStore,
            user,
            balance,
            isMyProfile,
            address,
            positions,
        }
    },

    components: { Button, Tooltip, EventCard },
})
</script>

<template>
    <div v-if="user && isProfileLoaded" :class="$style.wrapper">
        <metainfo>
            <template v-slot:title="{ content }"
                >{{ content }} • Juster</template
            >
        </metainfo>

        <h2 :class="$style.profile_title">
            {{ isMyProfile ? "My profile" : `User account` }}
        </h2>

        <div :class="$style.header">
            <div :class="$style.profile">
                <div :class="$style.avatar">
                    <Tooltip>
                        <img
                            :src="
                                `https://services.tzkt.io/v1/avatars/${address}`
                            "
                            :class="$style.image"
                        />

                        <template v-slot:content
                            >This avatar is supported by TzKT.io</template
                        >
                    </Tooltip>
                </div>

                <div @click="handleCopyAddress" :class="$style.username">
                    {{
                        `${address.slice(0, 8)}..${address.slice(
                            address.length - 3,
                            address.length,
                        )}`
                    }}
                    <Icon name="copy" size="14" />
                </div>
                <div :class="$style.status">
                    {{
                        isMyProfile ? accountStore.balance.toFixed(2) : balance
                    }}
                    XTZ
                </div>

                <div :class="$style.progress">
                    <div :class="$style.head">
                        <div :class="$style.tier">Tier 1</div>

                        <div :class="$style.exp">Exp 0</div>
                    </div>

                    <div :class="$style.line" />
                </div>

                <div :class="$style.badges">
                    <img src="@/assets/badge.png" :class="$style.badge" />
                    <img src="@/assets/badge.png" :class="$style.badge" />
                    <img src="@/assets/badge.png" :class="$style.badge" />
                    <img src="@/assets/badge.png" :class="$style.badge" />
                </div>
            </div>

            <div :class="$style.statistics">
                <h3 :class="$style.title">Statistics</h3>

                <div :class="$style.block">
                    <div :class="$style.stat">
                        <div :class="$style.key">Liquidity provided</div>
                        <div :class="$style.value">
                            {{ user.totalLiquidityProvided }}
                            <span>XTZ</span>
                        </div>
                    </div>
                    <div :class="$style.stat">
                        <div :class="$style.key">Net return</div>
                        <div :class="$style.value">
                            {{ user.totalProviderReward.toFixed(2) }}
                            <span>XTZ</span>
                        </div>
                    </div>
                    <div :class="$style.stat">
                        <div :class="$style.key">Fees collected</div>
                        <div :class="$style.value">
                            {{ user.totalFeesCollected.toFixed(0) }}
                            <span>XTZ</span>
                        </div>
                    </div>
                </div>

                <div :class="$style.divider" />

                <div :class="$style.block">
                    <div :class="$style.stat">
                        <div :class="$style.key">Bets value</div>
                        <div :class="$style.value">
                            {{ user.totalBetsAmount }} <span>XTZ</span>
                        </div>
                    </div>
                    <div v-if="user.totalWithdrawn" :class="$style.stat">
                        <div :class="$style.key">Withdrawn</div>
                        <div :class="$style.value">
                            {{ user.totalWithdrawn.toFixed(2) }}
                            <span>XTZ</span>
                        </div>
                    </div>
                    <div :class="$style.stat">
                        <div :class="$style.key">Bets</div>
                        <div :class="$style.value">
                            {{ user.totalBetsCount }}
                        </div>
                    </div>
                    <div :class="$style.stat">
                        <div :class="$style.key">Favorite Symbol</div>
                        <div :class="$style.value">TBD</div>
                    </div>
                </div>

                <div :class="$style.divider" />

                <div :class="$style.additional">
                    <div :class="$style.left">
                        <a
                            :href="`https://granadanet.tzkt.io/${address}`"
                            target="_blank"
                        >
                            <Button type="tertiary" size="small"
                                ><Icon name="open" size="14" /> View on
                                TzKT</Button
                            ></a
                        >
                    </div>

                    <div :class="$style.right">
                        <Button
                            @click="handleLogout"
                            type="tertiary"
                            size="small"
                            >Logout</Button
                        >
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isMyProfile" :class="$style.submissions">
            <div :class="$style.top">
                <div>
                    <h2>My submissions</h2>
                    <div :class="$style.description">
                        List of all current and archived events
                    </div>
                </div>
            </div>

            <div v-if="positions.length" :class="$style.items">
                <EventCard
                    v-for="position in positions"
                    :key="position.event.id"
                    :event="position.event"
                    :won="position.value !== 0 && !position.withdrawn"
                    showSymbol
                />
            </div>
            <div v-else :class="$style.empty">
                <div :class="$style.empty_title">
                    You dont have submissions
                </div>
                <div :class="$style.hint">
                    Make bets on events to be displayed in your profile
                </div>
            </div>
        </div>
    </div>

    <div v-if="!user && isProfileLoaded" :class="$style.empty_profile">
        <img
            :src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
            :class="$style.error_avatar"
        />

        <div :class="$style.error_title">Your profile is not ready yet</div>
        <div :class="$style.error_description">
            Once you participate in any event, your profile will become
            available!
        </div>

        <div :class="$style.error_buttons">
            <router-link to="/explore">
                <Button type="secondary" size="small"
                    ><Icon name="spark" size="14" /> Explore Juster</Button
                >
            </router-link>

            <div :class="$style.error_description">or</div>

            <Button @click="handleBack" type="tertiary" size="small"
                >Go back</Button
            >
        </div>
    </div>
</template>

<style module>
.wrapper {
}

.profile_title {
    font-family: "CalSans";

    margin-bottom: 16px;
}

.header {
    display: flex;
}

.profile {
    min-width: 300px;
    height: 330px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card-bg);

    padding: 26px;

    margin-right: 16px;
}

.avatar {
    width: 78px;
    height: 78px;
    border-radius: 50%;
    border: 4px solid var(--border);

    display: flex;
    align-items: center;
    justify-content: center;

    margin: 0 auto;
    margin-top: 4px;
    margin-bottom: 16px;
}

.image {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    user-select: none;
}

.username {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    font-size: 16px;
    line-height: 1.2;
    font-weight: 600;
    color: var(--text-primary);

    width: 100%;
    cursor: pointer;

    margin-bottom: 8px;
}

.username svg {
    fill: var(--opacity-40);
}

.status {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-tertiary);
    text-align: center;

    width: 100%;

    margin-bottom: 32px;
}

.progress {
    width: 100%;

    margin-bottom: 24px;
}

.head {
    display: flex;
    justify-content: space-between;

    margin-bottom: 8px;
}

.tier {
    font-size: 13px;
    line-height: 1.2;
    font-weight: 600;
    color: var(--text-primary);
}

.exp {
    font-size: 13px;
    line-height: 1.2;
    font-weight: 600;
    color: var(--text-tertiary);
}

.line {
    height: 6px;
    border-radius: 10px;
    background: var(--opacity-10);
}

.badges {
    display: flex;
    justify-content: space-between;
    opacity: 0.5;
}

.badge {
    width: 50px;
}

.statistics {
    width: 100%;
    height: 330px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card-bg);

    padding: 26px;
}

.title {
    margin-bottom: 20px;
}

.block {
    display: flex;
    flex-wrap: wrap;
}

.divider {
    width: 100%;
    height: 1px;
    background: var(--border);
    margin: 24px 0;
}

.stat {
    margin-right: 100px;
}

.key {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
    white-space: nowrap;

    margin-bottom: 12px;
}

.value {
    font-size: 16px;
    font-weight: 600;
    line-height: 1;
    color: var(--text-primary);
    white-space: nowrap;

    margin-bottom: 12px;
}

.value span {
    color: var(--text-tertiary);
}

.additional {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.additional span {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-tertiary);
}

.left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.right {
    display: flex;
    align-items: center;
}

.tip span {
    color: var(--green);
}

.submissions {
    margin-top: 60px;
}

.top {
    display: flex;
    justify-content: space-between;
}

.top h2 {
    font-family: "CalSans";
}

.items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    grid-gap: 16px;

    margin-top: 24px;
}

.description {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-top: 12px;
}

.empty {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 32px 0;
}

.empty_title {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);

    margin-bottom: 8px;
}

.hint {
    font-size: 13px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

/* empty profile styles */

.empty_profile {
    display: flex;
    flex-direction: column;
    align-items: center;

    margin-top: 100px;
}

.error_avatar {
    width: 50px;
    height: 50px;

    margin-bottom: 20px;
}

.error_title {
    font-size: 16px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    margin-bottom: 12px;
}

.error_description {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);
    text-align: center;

    max-width: 400px;
}

.error_description span {
    color: var(--text-secondary);
}

.error_buttons {
    display: flex;
    align-items: center;
    gap: 16px;

    margin-top: 24px;
}
</style>
