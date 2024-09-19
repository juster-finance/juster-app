import { onBeforeUnmount, watch, ref } from "vue"
import { useRouter } from "vue-router"
import { useTonAddress, useIsConnectionRestored, useTonConnectUI, useTonWallet } from '@townsquarelabs/ui-vue';
import { demoMode, localStorageKeys } from "@config"
import { useAccountStore } from "@store/account"
import { useAppStore } from "@store/app"
import { useNotificationsStore } from "@store/notifications";
import { parseJwt } from "@/services/utils/auth";
import { generateTonProof, checkTonProof } from "@/api/auth"
import { useMarket } from "@/composable/market"

export const useAuth = () => {
    const notificationsStore = useNotificationsStore()
    const accountStore = useAccountStore()
    const appStore = useAppStore()
    const { setupUser } = useMarket()
    const router = useRouter()
    
    const address = useTonAddress(false)
    const wallet = useTonWallet()
    const [tonConnectUI] = useTonConnectUI()
    const isConnectionRestored = useIsConnectionRestored()
    const isAuthTokenValid = ref(false)
    
    watch([address, isAuthTokenValid], async ([address, isAuthTokenValid]) => {
        if (!address || !isAuthTokenValid) 
            return
        
        accountStore.setPkh(address)
        await accountStore.updateBalance()
        setupUser()

        /** Onboarding redirect */
		if (!localStorage.getItem(localStorageKeys.IS_ONBOARDING_SHOWN)) {
			router.push("/welcome")

			notificationsStore.create({
				notification: {
					type: "success",
					title: "Successfuly connected",
					description:
						"Go through a little onboarding to quickly explore the features of the project",
					autoDestroy: true,

					actions: [
						{
							name: "Skip Onboarding",
							callback: () => router.push("/explore"),
						},
					],
				},
			})
		} else if (appStore.prevRoute?.path) {
			router.push(appStore.prevRoute.path)

			notificationsStore.create({
				notification: {
					type: "success",
					title: "Successfully connected",
					description:
						"Wallet is connected and we recovered the previous page before login",
					autoDestroy: true,

					actions: [
						{
							name: "Go to Explore",
							callback: () => router.push("/"),
						},
					],
				},
			})
		}
    })
    
    let refreshPayloadIntervalId;
    let expirationTimeoutId;
    watch([wallet, isConnectionRestored], async () => {
        if (!isConnectionRestored.value)
            return;
    
        const logout = async (message) => {
            isAuthTokenValid.value = false;
            localStorage.removeItem(localStorageKeys.AUTH_TOKEN);
            tonConnectUI.disconnect();
            accountStore.logout();
            notificationsStore.create({
                notification: {
                    type: "Warning",
                    title: message,
                    description: "Try connect wallet again.",
                    autoDestroy: true,
                },
            });
        }
    
        const validateToken = async (token) => {
            clearTimeout(expirationTimeoutId);
            const parsedJwt = parseJwt(token);
            const isExpired = Date.now() > parsedJwt.expiredAt;
            if (isExpired || wallet?.value?.account?.address !== parsedJwt.subject) {
                logout('Auth token expired');
            } else {
                isAuthTokenValid.value = true;
                expirationTimeoutId = setTimeout(() => {
                    logout('Auth token expired');
                }, parsedJwt.expiredAt - Date.now());
            }
        }
    
        const token = localStorage.getItem(localStorageKeys.AUTH_TOKEN);
        if (token) {
            validateToken(token);
            return;
        }
    
        refreshPayloadIntervalId && clearInterval(refreshPayloadIntervalId);
        if (!wallet.value) {
            const refreshPayload = async () => {
                tonConnectUI.setConnectRequestParameters({ state: 'loading' });
    
                const value = await generateTonProof(demoMode.baseUrl);
                if (value)
                    tonConnectUI.setConnectRequestParameters({state: 'ready', value});
                else
                    tonConnectUI.setConnectRequestParameters(null);
            }
    
            refreshPayload();
            refreshPayloadIntervalId = setInterval(refreshPayload, demoMode.walletPayloadTokenExpiresInSeconds * 1000);
            return;
        }
    
        if (wallet.value.connectItems?.tonProof && !('error' in wallet.value.connectItems.tonProof)) {
            const authToken = await checkTonProof(demoMode.baseUrl, wallet.value.connectItems.tonProof.proof, wallet.value.account);
            if (authToken) {
                validateToken(authToken);
                localStorage.setItem(localStorageKeys.AUTH_TOKEN, authToken);
            } else {
                logout('Auth token could not be generated')
            }
        } else {
            logout('Wallet could not sign the proof')
        }
    }, {immediate: true});

    onBeforeUnmount(() => {
        clearInterval(refreshPayloadIntervalId);
        clearTimeout(expirationTimeoutId);
    })
}
