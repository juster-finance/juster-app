import { reactive, ref, onBeforeUnmount } from "vue"
import { DateTime } from "luxon"

/**
 * Services
 */
import { supportedMarkets } from "@config"
import { juster, destroySubscription } from "@sdk"

/**
 * API
 */
import { fetchMarkets } from "@/api/markets"
import { fetchQuotesByMarket, fetchQuoteByTimestamp } from "@/api/quotes"
import { fetchUserPositionsForWithdraw } from "@/api/positions"
import { fetchUserWithdrawals } from "@/api/users"

/**
 * Store
 */
import { useMarketStore } from "@store/market"
import { useAccountStore } from "@store/account"

/**
 * gql
 */
	
import { position, userWithdrawal as userWithdrawalModel } from "@/graphql/models"

export const useMarket = () => {
	const marketStore = useMarketStore()
	const accountStore = useAccountStore()

	const markets = reactive([])

	const newPositionsSubscription = ref({})
	const updateBalanceSubscription = ref({})
	const updateWithdrawalsSubscription = ref({})
	const newWithdrawnPositionsSubscription = ref({})
	const quotesSubscriptions = ref([])

	const setupUser = async () => {
		/** All positions for withdraw */
		const userPositions = await fetchUserPositionsForWithdraw({
			address: accountStore.pkh,
		})
		if (userPositions.length) {
			accountStore.positionsForWithdrawal = userPositions
			accountStore.isPositionsLoading = false
		}

		/** Withdrawals */
		accountStore.withdrawals = await fetchUserWithdrawals({
			address: accountStore.pkh,
		})

		/**
		 * Subscriptions
		 */

		/** New Positions */
		newPositionsSubscription.value = await juster.gql
			.subscription({
				position: [
					{
						where: {
							userId: {
								_eq: accountStore.pkh,
							},
							withdrawn: { _eq: false },
							value: { _neq: 0 },
							event: { status: { _eq: "FINISHED" } },
						},
					},
					{
						...position,
					},
				],
			})
			.subscribe({
				next: (data) => {
					const newPositions = data.position

					newPositions.forEach((newPosition) => {
						if (
							accountStore.positionsForWithdrawal.some(
								(position) => position.id == newPosition.id,
							)
						)
							return

						accountStore.positionsForWithdrawal.push(newPosition)
					})
				},
				error: console.error,
			})

		/** Update user balance */
		updateBalanceSubscription.value = await juster.gql
			.subscription({
				user: [
					{
						where: {
							address: { _eq: accountStore.pkh },
						},
					},
					{
						balance: true,
						lockedAmount: true,
					},
				],
			})
			.subscribe({
				next: (data) => {
					const user = data.user[0]
					accountStore.balance = user.balance.toFixed(2)
					accountStore.lockedAmount = user.lockedAmount.toFixed(2)
				},
				error: console.error,
			})

		/** Update user withdrawals */
		updateWithdrawalsSubscription.value = await juster.gql
			.subscription({
				withdrawal: [
					{
						where: { userId: { _eq: accountStore.pkh } },
						order_by: { id: "desc" },
					},
					userWithdrawalModel,
				],
			})
			.subscribe({
				next: (data) => {
					const newWithdrawals = data.withdrawal

					newWithdrawals.forEach((newWithdrawal) => {
						if (accountStore.withdrawals.some((withdrawal) => withdrawal.id == newWithdrawal.id))
							return

						accountStore.withdrawals.push(newWithdrawal)
					})
				},
				error: console.error,
			})

		/** Newly withdrawn positions */
		newWithdrawnPositionsSubscription.value = await juster.gql
			.subscription({
				position: [
					{
						where: {
							userId: { _eq: accountStore.pkh },
							withdrawn: { _eq: true },
							event: { status: { _eq: "FINISHED" } },
						},
					},
					{
						...position,
					},
				],
			})
			.subscribe({
				next: (data) => {
					const { position: withdrawnPositions } = data

					const positionsIdsForWithdrawal =
						accountStore.positionsForWithdrawal.map((pos) => pos.id)
					withdrawnPositions.forEach((withdrawnPosition) => {
						if (
							positionsIdsForWithdrawal.includes(
								withdrawnPosition.id,
							)
						) {
							accountStore.removePosition(withdrawnPosition.id)
						}
					})
				},
				error: console.error,
			})
	}

	const updateWithdrawals = async () => {
		accountStore.withdrawals = await fetchUserWithdrawals({
			address: accountStore.pkh,
		})
	}

	/**
	 * Subscriptions
	 */

	/** Quotes */
	const subscribeToQuotes = async () => {
		markets.value.forEach(async market => {
			const subscription = await juster.gql
				.subscription({
					quotesWma: [
						{
							where: {
								currencyPairId: { _eq: market.id },
							},
							order_by: { timestamp: "desc" },
							limit: 1,
						},
						{
							currencyPairId: true,
							price: true,
							timestamp: true,
						},
					],
				})
				.subscribe({
					next: (data) => {
						const quote = data.quotesWma[0]
						marketStore.updateQuotes({
							target: market.symbol,
							quote,
						})
					},
					error: console.error,
				})

			quotesSubscriptions.value.push(subscription)
		})
	}

	const setupMarket = async () => {
		const allMarkets = await fetchMarkets()

		/** only available */
		markets.value = allMarkets.filter(
			(market) => supportedMarkets[market.symbol],
		)

		markets.value.forEach((market) => {
			marketStore.setMarket({ target: market.symbol, symbol: market })
		})
		marketStore.isMarketsLoaded = true

		/** quotes */
		const prevWeekDt = DateTime.now()
			.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
			.minus({ day: 7 })
			.toISO()

		markets.value.forEach(async (market) => {
			const quotes = await fetchQuotesByMarket({
				id: market.id,
				limit: 1000,
			})
			marketStore.setQuotes({ target: market.symbol, quotes })

			/** weekly diff */
			const historyQuote = await fetchQuoteByTimestamp({
				id: market.id,
				ts: prevWeekDt,
			})
			marketStore.setHistoryPrice({
				target: market.symbol,
				price: historyQuote[0] ? historyQuote[0].price : 0,
			})
		})
		subscribeToQuotes()
	}

	const closeQuotesSubscriptions = () => {
		quotesSubscriptions.value.forEach((subscription) => {
			destroySubscription(subscription)
		})
	}

	onBeforeUnmount(() => {
		destroySubscription(updateBalanceSubscription.value)
		destroySubscription(newPositionsSubscription.value)
		destroySubscription(newWithdrawnPositionsSubscription.value)
		closeQuotesSubscriptions()
		destroySubscription(updateWithdrawalsSubscription.value)
	})

	return { setupMarket, subscribeToQuotes, closeQuotesSubscriptions, setupUser, updateWithdrawals, markets }
}
