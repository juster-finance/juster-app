<script>
import { defineComponent, toRefs } from "vue"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import {
    Dropdown,
    DropdownItem,
    DropdownDivider,
} from "@/components/ui/Dropdown"

/**
 * Services
 */
import { toClipboard } from "@/services/utils/global"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

export default defineComponent({
    name: "UserCard",
    props: {
        user: Object,
    },

    setup(props) {
        const { user } = toRefs(props)

        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        const handleCopy = target => {
            if (target == "address") {
                notificationsStore.create({
                    notification: {
                        type: "success",
                        title: "User address copied to clipboard",
                        description: "Use Ctrl+V to paste",
                        autoDestroy: true,
                    },
                })
                toClipboard(user.value.userId)
            }
            if (target == "url") {
                notificationsStore.create({
                    notification: {
                        type: "success",
                        title: "Profile URL copied to clipboard",
                        description: "Use Ctrl+V to paste",
                        autoDestroy: true,
                    },
                })
                toClipboard(
                    `https://app.juster.fi/profile/${user.value.userId}`,
                )
            }
        }

        return { handleCopy, accountStore }
    },

    components: { Button, Dropdown, DropdownItem, DropdownDivider },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.left">
            <div :class="$style.avatar">
                <img
                    :src="`https://services.tzkt.io/v1/avatars/${user.userId}`"
                />
            </div>

            <div :class="$style.base">
                <div @click="handleCopy('address')" :class="$style.address">
                    <template v-if="user.userId !== accountStore.pkh">
                        {{
                            `${user.userId.slice(0, 8)}..${user.userId.slice(
                                user.userId.length - 3,
                                user.userId.length,
                            )}`
                        }}
                    </template>
                    <template v-else>You</template>

                    <Icon name="copy" size="14" />
                </div>

                <div :class="$style.params">
                    <div :class="$style.param">
                        Shares: <span>{{ user.shares }}</span>
                    </div>
                    <div :class="$style.dot" />
                    <div :class="$style.param">
                        Liquidity:
                        <span
                            >{{
                                (
                                    user.liquidityProvidedBelow +
                                    user.liquidityProvidedAboveEq
                                ).toFixed(2)
                            }}
                            XTZ</span
                        >
                    </div>
                </div>
            </div>
        </div>

        <Dropdown>
            <template v-slot:trigger>
                <Button type="tertiary" size="small" icon="dots" />
            </template>

            <template v-slot:dropdown>
                <router-link :to="`/profile/${user.userId}`">
                    <DropdownItem
                        ><Icon name="open" size="16" />Open User
                        profile</DropdownItem
                    >

                    <DropdownDivider />
                </router-link>

                <a
                    :href="`https://granadanet.tzkt.io/${user.userId}`"
                    target="_blank"
                >
                    <DropdownItem
                        ><Icon name="open" size="16" />View on TzKT
                    </DropdownItem>
                </a>

                <DropdownDivider />

                <DropdownItem @click="handleCopy('address')"
                    ><Icon name="copy" size="16" />Copy address
                </DropdownItem>
                <DropdownItem @click="handleCopy('url')"
                    ><Icon name="copy" size="16" />Copy URL
                </DropdownItem>
            </template>
        </Dropdown>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    border-radius: 8px;
    border: 1px solid var(--border);
    height: 50px;
    padding: 0 10px;
}

.left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.avatar {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--opacity-10);
}

.avatar img {
    width: 28px;
    height: 28px;
}

.base {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.address {
    display: flex;
    align-items: center;
    gap: 6px;

    cursor: pointer;

    font-size: 13px;
    line-height: 1.1;
    font-weight: 500;
    color: var(--text-primary);
    fill: var(--text-tertiary);
}

.params {
    display: flex;
    align-items: center;
    gap: 8px;
}

.param {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.param span {
    color: var(--text-secondary);
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
}
</style>
