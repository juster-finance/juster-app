<script>
import { defineComponent, ref, reactive, computed, inject } from "vue"
import { useRoute, useRouter } from "vue-router"
import { NetworkType } from "@airgap/beacon-sdk"

/**
 * Services
 */
import { juster } from "@/services/tools"

/**
 * Local
 */
import AppStatus from "@/components/local/AppStatus"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import {
    Dropdown,
    DropdownItem,
    DropdownDivider,
} from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip"

/**
 * Modals
 */
import ConnectingModal from "@/components/local/modals/ConnectingModal"
import CustomLoginModal from "@/components/local/modals/CustomLoginModal"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

/**
 * API
 */
import { fetchUserPositionsForWithdrawal } from "@/api/positions"

export default defineComponent({
    setup() {
        const amplitude = inject("amplitude")
        const identify = new amplitude.Identify()

        const notificationsStore = useNotificationsStore()
        const accountStore = useAccountStore()

        const showSettingsModal = ref(false)
        const showConnectingModal = ref(false)

        const route = useRoute()
        const router = useRouter()

        const links = reactive([
            {
                name: "Explore",
                url: "/explore",
            },
            {
                name: "Events",
                url: "/events",
            },
            {
                name: "Symbols",
                url: "/symbols",
            },
        ])

        const isActive = (url) => {
            if (!route.name) return
            return route.path.startsWith(url)
        }

        const login = () => {
            juster._provider.client.getActiveAccount().then(async (account) => {
                if (!localStorage["connectingModal"]) {
                    showConnectingModal.value = true

                    address.value = account.address
                    network.value = account.network.type
                } else {
                    /** analytics */
                    identify.set("address", account.address)
                    identify.set("network", account.network.type)
                    amplitude.identify(identify)
                    amplitude.logEvent("login", { address: account.address })

                    accountStore.pkh = account.address
                    accountStore.updateBalance()

                    // todo: sep. func
                    /** check for won positions */
                    const wonPositions = await fetchUserPositionsForWithdrawal({
                        address: accountStore.pkh,
                    })

                    if (wonPositions.length) {
                        accountStore.wonPositions = wonPositions
                    }
                }
            })
        }

        /**
         * Default Login
         */
        const address = ref("")
        const network = ref("")
        const handleLogin = async () => {
            await juster.sync()
            login()
        }

        /**
         * Custom RPC Login
         */
        const showCustomLoginModal = ref(false)
        const handleCustomLogin = () => {
            showCustomLoginModal.value = true
        }
        const handleSelectCustomNode = async (node) => {
            await juster._provider.requestPermissions({
                network: {
                    type: NetworkType.CUSTOM,
                    name: node.value.name,
                    rpcUrl: node.value.url,
                },
            })
            login()
        }

        const handleAgree = () => {
            showConnectingModal.value = false

            localStorage["connectingModal"] = true

            /** analytics */
            identify.set("address", address.value)
            identify.set("network", network.value)
            amplitude.identify(identify)
            amplitude.logEvent("registration", { address: address.value })

            accountStore.pkh = address.value
            address.value = ""

            accountStore.updateBalance()
        }
        const handleDisagree = () => {
            showConnectingModal.value = false

            address.value = ""

            juster._provider.client.clearActiveAccount().then(async () => {
                await juster._provider.client.getActiveAccount()
                accountStore.setPkh("")
                router.push("/")

                notificationsStore.create({
                    notification: {
                        type: "success",
                        title: "You are signed out",
                        description:
                            "You have not confirmed the registration and agreement with the Terms of Use",
                        autoDestroy: true,
                    },
                })
            })
        }

        const handleOpenProfile = () => {
            router.push("/profile")

            amplitude.logEvent("openProfile")
        }

        const handleOpenWithdrawals = () => {
            router.push("/withdrawals")

            amplitude.logEvent("openWithdrawals")
        }

        const handleLogout = () => {
            juster._provider.client.clearActiveAccount().then(async () => {
                await juster._provider.client.getActiveAccount()

                amplitude.logEvent("logout", { address: accountStore.pkh })

                accountStore.setPkh("")
                router.push("/")

                accountStore.wonPositions = []

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

        const pkh = computed(() => accountStore.pkh)

        return {
            links,
            isActive,
            juster,
            address,
            handleLogin,
            handleCustomLogin,
            handleAgree,
            handleDisagree,
            handleLogout,
            pkh,
            showSettingsModal,
            showConnectingModal,
            showCustomLoginModal,
            handleSelectCustomNode,
            accountStore,
            handleOpenProfile,
            handleOpenWithdrawals,
        }
    },

    components: {
        ConnectingModal,
        CustomLoginModal,
        Tooltip,
        AppStatus,
        Button,
        Dropdown,
        DropdownItem,
        DropdownDivider,
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <CustomLoginModal
            :show="showCustomLoginModal"
            @onSelectCustomNode="handleSelectCustomNode"
            @onClose="showCustomLoginModal = false"
        />
        <ConnectingModal
            :show="showConnectingModal"
            :address="address"
            @onAgree="handleAgree"
            @onClose="handleDisagree"
        />

        <div :class="$style.base">
            <div :class="$style.left">
                <router-link to="/explore" :class="$style.logo"
                    ><img src="@/assets/logo.png"
                /></router-link>

                <div :class="$style.links">
                    <router-link
                        v-for="link in links"
                        :key="link.name"
                        :to="link.url"
                        :class="isActive(link.url) && $style.active"
                        >{{ link.name }}</router-link
                    >
                </div>
            </div>

            <div :class="$style.right">
                <!-- <AppStatus :class="$style.app_status" /> -->

                <Tooltip v-if="pkh" position="left">
                    <div :class="$style.testnet_warning">
                        <Icon
                            name="Warning"
                            size="16"
                            :class="$style.warning_icon"
                        />
                        Granada Testnet
                    </div>

                    <template v-slot:content>
                        Granada Testnet in use.
                        <span>You can change the network in the settings</span>
                    </template>
                </Tooltip>

                <Icon
                    name="Notifications"
                    size="16"
                    :class="$style.notifications_icon"
                />

                <div :class="$style.buttons">
                    <!-- <Button
                        v-if="!pkh"
                        @click="handleLogin"
                        type="primary"
                        size="small"
                    >
                        <Icon name="user" size="12" />
                        Sign in</Button
                    > -->

                    <!-- todo: sep component -->
                    <div v-if="!pkh" :class="$style.signin_button">
                        <div @click="handleLogin" :class="$style.signin">
                            Sign in
                        </div>
                        <div
                            @click="handleCustomLogin"
                            :class="$style.custom_signin"
                        >
                            <Icon name="settings" size="14" />
                        </div>
                    </div>

                    <Dropdown>
                        <template v-slot:trigger>
                            <div :class="$style.avatar">
                                <img
                                    v-if="pkh"
                                    :src="`https://services.tzkt.io/v1/avatars/${pkh}`"
                                />
                                <div
                                    v-if="
                                        accountStore.wonPositions.length &&
                                        accountStore.pkh
                                    "
                                    :class="$style.indicator"
                                />
                            </div>
                        </template>

                        <template v-slot:dropdown>
                            <div
                                @click="handleOpenProfile"
                                :class="$style.profile"
                            >
                                <Icon name="user" size="16" />

                                <div :class="$style.info">
                                    <div :class="$style.address">
                                        {{
                                            `${accountStore.pkh.slice(
                                                0,
                                                5,
                                            )}..${accountStore.pkh.slice(
                                                accountStore.pkh.length - 3,
                                                accountStore.pkh.length,
                                            )}`
                                        }}
                                    </div>
                                    <div :class="$style.balance">
                                        {{ accountStore.balance }}
                                        XTZ
                                    </div>
                                </div>
                            </div>

                            <DropdownItem @click="handleOpenWithdrawals">
                                <div :class="$style.dropdown_icon">
                                    <Icon name="money" size="16" />
                                    <div
                                        v-if="accountStore.wonPositions.length"
                                        :class="$style.dropdown_indicator"
                                    />
                                </div>
                                Withdrawals
                            </DropdownItem>

                            <DropdownDivider />

                            <router-link to="/releases">
                                <DropdownItem>
                                    <Icon name="merge" size="16" />
                                    Releases
                                </DropdownItem>
                            </router-link>
                            <a
                                href="https://fishy-cheque-5ae.notion.site/Juster-Guide-48af7e1106634cec92597dffdef531b6"
                                target="_blank"
                            >
                                <DropdownItem
                                    ><Icon
                                        name="book"
                                        size="16"
                                    />Documentation</DropdownItem
                                ></a
                            >
                            <DropdownItem
                                @click="accountStore.showOnboarding = true"
                                ><Icon name="help" size="16" />
                                Onboarding</DropdownItem
                            >

                            <DropdownDivider />

                            <DropdownItem @click="handleLogout"
                                ><Icon name="logout" size="16" />
                                Logout</DropdownItem
                            >
                        </template>
                    </Dropdown>
                </div>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    position: sticky;
    top: 0;
    width: 100%;
    min-height: 80px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-bottom: 1px solid var(--border);
    z-index: 1;

    backdrop-filter: blur(5px);
}

.base {
    display: flex;
    align-items: center;
    justify-content: space-between;

    max-width: 1250px;
    width: 100%;

    margin: 0 32px;
}

.right {
    display: flex;
    align-items: center;
}

.app_status {
    margin-right: 40px;
}

.testnet_warning {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    height: 28px;
    padding: 0 8px 0 6px;

    font-size: 12px;
    line-height: 1px;
    font-weight: 600;
    color: var(--yellow);

    transition: all 0.2s ease;
}

.testnet_warning svg {
    fill: var(--yellow);
}

.left {
    display: flex;
    align-items: center;
}

.logo {
    display: flex;
}

.logo img {
    cursor: pointer;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #fff;
    padding: 4px;
}

.links {
    margin-left: 40px;
}

.links a {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-tertiary);

    margin-right: 32px;

    transition: color 0.2s ease;
}

.links a.active {
    color: var(--text-primary);
}

.links a:hover {
    color: var(--text-primary);
}

.notifications_icon {
    fill: var(--icon);

    margin-right: 20px;
    margin-left: 32px;

    transition: fill 0.2s ease;
}

.notifications_icon:hover {
    fill: var(--icon-high);
}

.buttons {
    display: flex;
    gap: 8px;
}

.signin_button {
    height: 30px;
    border-radius: 8px;
    border: 1px solid var(--border);

    display: flex;
    align-items: center;

    transition: transform 0.2s ease;
}

.signin_button:active {
    transform: translateY(1px);
}

.signin {
    font-size: 13px;
    line-height: 28px;
    font-weight: 600;
    color: var(--text-primary);
    background: var(--btn-secondary-bg);

    padding: 0 10px 0 12px;
    border-radius: 8px 0 0 8px;
    border-right: 1px solid var(--border);

    transition: background 0.2s ease;
}

.signin:hover {
    background: var(--btn-secondary-bg-hover);
}

.custom_signin {
    display: flex;
    align-items: center;
    height: 28px;
    border-radius: 0 8px 8px 0;
    padding: 0 10px;

    fill: var(--text-secondary);
    background: var(--btn-secondary-bg);

    transition: background 0.2s ease;
}

.custom_signin:hover {
    background: var(--btn-secondary-bg-hover);
}

.avatar {
    position: relative;
}

.indicator {
    position: absolute;
    top: 0;
    right: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--red);
}

.avatar img {
    display: flex;
    width: 28px;
    padding: 2px;
    box-sizing: content-box;

    background: var(--opacity-05);
    border-radius: 50px;

    transition: all 0.2s ease;
}

.avatar:hover img {
    background: var(--opacity-10);
}

.avatar:active img {
    transform: translateY(1px);
}

.dropdown_icon {
    position: relative;
}

.dropdown_indicator {
    position: absolute;
    top: 0;
    right: 8px;

    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--red);
}

.profile {
    display: flex;
    gap: 8px;

    margin: 0 8px;
    padding: 8px 16px 8px 8px;
    background: transparent;
    border-radius: 6px;

    transition: background 0.2s ease;
}

.profile svg {
    fill: var(--opacity-40);
}

.profile .info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.info .address {
    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-primary);
}

.info .balance {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.profile:hover {
    background: var(--opacity-05);
}

@media (max-width: 600px) {
    .links {
        display: none;
    }
}
</style>
