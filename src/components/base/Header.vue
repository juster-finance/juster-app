<script>
import { defineComponent, ref, reactive, computed } from "vue"
import { useRoute, useRouter } from "vue-router"

/**
 * Services
 */
import { juster } from "@/services/tools"

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
import TheSettingsModal from "@/components/local/modals/Settings/TheSettingsModal"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

export default defineComponent({
    setup() {
        const notificationsStore = useNotificationsStore()
        const accountStore = useAccountStore()

        const showSettingsModal = ref(false)

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
            {
                name: "Rating",
                url: "/rating",
            },
        ])

        const isActive = url => {
            if (!route.name) return
            return route.path.startsWith(url)
        }

        const handleLogin = async () => {
            await juster.sync()
            juster.getPkh().then(pkh => {
                accountStore.setPkh(pkh)
            })
        }

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

        const pkh = computed(() => accountStore.pkh)

        return {
            links,
            isActive,
            juster,
            handleLogin,
            handleLogout,
            pkh,
            showSettingsModal,
        }
    },

    components: {
        TheSettingsModal,
        Tooltip,
        Button,
        Dropdown,
        DropdownItem,
        DropdownDivider,
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <TheSettingsModal
            :show="showSettingsModal"
            @onClose="showSettingsModal = false"
        />

        <div :class="$style.base">
            <div :class="$style.left">
                <router-link to="/explore"
                    ><img src="@/assets/logo.png" :class="$style.logo"
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
                <Tooltip v-if="pkh" position="left">
                    <Icon
                        name="Warning"
                        size="20"
                        :class="$style.warning_icon"
                    />

                    <template v-slot:content>
                        Florence Testnet in use.
                        <span>You can change the network in the settings</span>
                    </template>
                </Tooltip>

                <Icon
                    name="Notifications"
                    size="16"
                    :class="$style.notifications_icon"
                />

                <div :class="$style.buttons">
                    <Button
                        v-if="!pkh"
                        @click="handleLogin"
                        type="primary"
                        size="small"
                    >
                        Sign in</Button
                    >

                    <Dropdown>
                        <template v-slot:trigger>
                            <img
                                v-if="pkh"
                                :src="
                                    `https://services.tzkt.io/v1/avatars/${pkh}`
                                "
                                :class="$style.avatar"
                            />
                        </template>

                        <template v-slot:dropdown>
                            <router-link to="/profile">
                                <DropdownItem
                                    ><Icon name="user" size="16" />My
                                    profile</DropdownItem
                                ></router-link
                            >
                            <router-link to="/withdrawals">
                                <DropdownItem
                                    ><Icon name="money" size="16" />
                                    Withdrawals</DropdownItem
                                >
                            </router-link>
                            <DropdownItem disabled
                                ><Icon name="settings" size="16" />
                                Settings</DropdownItem
                            >

                            <DropdownDivider />

                            <router-link to="/docs">
                                <DropdownItem
                                    ><Icon
                                        name="book"
                                        size="16"
                                    />Documentation</DropdownItem
                                ></router-link
                            >
                            <DropdownItem disabled
                                ><Icon name="bolt" size="16" />
                                Releases</DropdownItem
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

.left {
    display: flex;
    align-items: center;
}

.logo {
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

.warning_icon {
    fill: var(--yellow);
    padding: 6px;
    box-sizing: content-box;
    border-radius: 8px;

    transition: all 0.2s ease;
}

.warning_icon:hover {
    background: var(--opacity-10);
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

.avatar {
    display: flex;
    width: 28px;
    padding: 2px;
    box-sizing: content-box;

    background: var(--opacity-05);
    border-radius: 50px;

    transition: all 0.2s ease;
}

.avatar:hover {
    background: var(--opacity-20);
}

.avatar:active {
    transform: translateY(1px);
}

@media (max-width: 600px) {
    .links {
        display: none;
    }
}
</style>
