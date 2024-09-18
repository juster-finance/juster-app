import { juster } from "./juster"

const fetchBalance = async (address) => {
	const user = await juster.sdk.getUser(address)
	return user.balance.toFixed(2)
}

export { fetchBalance }
