<script>
import { defineComponent, reactive } from "vue"
import { useMeta } from "vue-meta"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

/**
 * Services
 */
import { numberWithSymbol } from "@/services/utils/amounts"

export default defineComponent({
    name: "SymbolsBase",

    setup() {
        const marketStore = useMarketStore()

        const sort = reactive({
            liquidity: "desc",
            perfomance: "desc",
            tier: "asc",
        })
        const users = reactive([
            {
                username: "User 1",
                tier: 1,
                liquidity: 210432,
                perfomance: 34,
            },
            {
                username: "User 2",
                tier: 2,
                liquidity: 240940,
                perfomance: 65,
            },
            {
                username: "User 3",
                tier: 3,
                liquidity: 232930,
                perfomance: 23,
            },
            {
                username: "User 4",
                tier: 4,
                liquidity: 209310,
                perfomance: 12,
            },
            {
                username: "User 5",
                tier: 5,
                liquidity: 174830,
                perfomance: 94,
            },
            {
                username: "User 6",
                tier: 6,
                liquidity: 162902,
                perfomance: 74,
            },
            {
                username: "User 7",
                tier: 7,
                liquidity: 124092,
                perfomance: 9,
            },
        ])

        const sortBy = (target) => {
            switch (target) {
                case "tier":
                    if (sort.tier == "asc") {
                        users.sort((a, b) => b.tier - a.tier)
                        sort.tier = "desc"

                        break
                    }
                    if (sort.tier == "desc") {
                        users.sort((a, b) => a.tier - b.tier)
                        sort.tier = "asc"

                        break
                    }

                    break

                case "liquidity":
                    if (sort.liquidity == "asc") {
                        users.sort((a, b) => b.liquidity - a.liquidity)
                        sort.liquidity = "desc"

                        break
                    }
                    if (sort.liquidity == "desc") {
                        users.sort((a, b) => a.liquidity - b.liquidity)
                        sort.liquidity = "asc"

                        break
                    }

                    break

                case "perfomance":
                    if (sort.perfomance == "asc") {
                        users.sort((a, b) => b.perfomance - a.perfomance)
                        sort.perfomance = "desc"

                        break
                    }
                    if (sort.perfomance == "desc") {
                        users.sort((a, b) => a.perfomance - b.perfomance)
                        sort.perfomance = "asc"

                        break
                    }

                    break
            }
        }

        /** Meta */
        useMeta({
            title: "Leaderboard",
            description:
                "Liquidity provider leaderboard based on perfomance & earnings",
        })

        return { marketStore, users, sort, sortBy, numberWithSymbol }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <metainfo>
            <template v-slot:title="{ content }"
                >{{ content }} • Juster</template
            >
        </metainfo>

        <h1>Leaderboard</h1>
        <div :class="$style.description">
            Liquidity provider leaderboard based on perfomance & earnings
        </div>

        <div :class="$style.leaderboard">
            <table>
                <tr>
                    <th @click="sortBy('tier')">
                        user
                        <Icon
                            name="arrow_down"
                            size="10"
                            :class="[
                                $style.icon,
                                sort.tier == 'asc' && $style.reverse,
                            ]"
                        />
                    </th>
                    <th @click="sortBy('liquidity')">
                        liquidity
                        <Icon
                            name="arrow_down"
                            size="10"
                            :class="[
                                $style.icon,
                                sort.liquidity == 'asc' && $style.reverse,
                            ]"
                        />
                    </th>
                    <th @click="sortBy('perfomance')">
                        perfomance
                        <Icon
                            name="arrow_down"
                            size="10"
                            :class="[
                                $style.icon,
                                sort.perfomance == 'asc' && $style.reverse,
                            ]"
                        />
                    </th>
                    <th>earned</th>
                </tr>

                <tr v-for="user in users.slice(0, 5)" :key="user.tier">
                    <td>
                        <div :class="$style.user">
                            <div :class="$style.avatar" />

                            <div :class="$style.info">
                                <div :class="$style.username">
                                    {{ user.username }}
                                </div>
                                <div :class="$style.tier">
                                    Tier {{ user.tier }}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>$ {{ numberWithSymbol(user.liquidity, ",") }}</td>
                    <td>{{ user.perfomance }}%</td>
                    <td>$ {{ numberWithSymbol(user.liquidity * 0.1, ",") }}</td>
                </tr>
            </table>

            <div :class="$style.bottom">
                <span>249 users</span>
                <span>Updated 5 min ago</span>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
}

.description {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-top: 12px;
    margin-bottom: 24px;
}

.leaderboard {
    border-radius: 8px;
    border: 1px solid var(--border);
}

.leaderboard table {
    width: 100%;
    border-spacing: 0;
}

.leaderboard tr {
    display: flex;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
}

.leaderboard th {
    text-transform: uppercase;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    color: var(--text-tertiary);

    cursor: pointer;

    display: flex;
    flex: 1;
    align-items: flex-start;
}

.leaderboard td {
    display: flex;
    align-items: center;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    flex: 1;
    padding: 0;
}

.bottom {
    display: flex;
    justify-content: space-between;

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    padding: 16px 20px;
}

.user {
    display: flex;
    align-items: center;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);

    margin-right: 14px;
}

.username {
    margin-bottom: 6px;
}

.tier {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.icon {
    fill: var(--icon);

    margin-left: 6px;

    transition: transform 0.2s ease;
}

.icon.reverse {
    transform: rotate(180deg);
}
</style>
