import { ref, watch, reactive } from "vue"

/**
 * Services
 */
import { countdown } from "@/services/utils/date"

export const useCountdown = event => {
    const countdownText = ref("00:00:00")
    const status = ref("In progress")
    const time = reactive({ h: 0, m: 0 })

    let countdownInterval

    const start = () => {
        const target = new Date(event.value?.bets_close_time).getTime()

        const { h, m, s, d } = countdown({
            target,
            now: new Date().getTime(),
        })

        if (d < 0) {
            status.value = "Finished"
            return { countdownText, status }
        }

        countdownText.value = `${h < 10 ? `0${h}` : h}:${
            m < 10 ? `0${m}` : m
        }:${s < 10 ? `0${s}` : s}`

        time.h = h
        time.m = m

        countdownInterval = setInterval(() => {
            const now = new Date().getTime()
            const { h, m, s, d } = countdown({ target, now })

            time.h = h
            time.m = m

            if (d < 0) {
                status.value = "Finished"
                countdownText.value = `00:00:00`
                clearInterval(countdownInterval)
            } else {
                countdownText.value = `${h < 10 ? `0${h}` : h}:${
                    m < 10 ? `0${m}` : m
                }:${s < 10 ? `0${s}` : s}`
            }
        }, 1000)
    }

    const stop = () => {
        clearInterval(countdownInterval)
    }

    if (event.value) start()
    watch(event, () => {
        if (event.value) start()
    })

    return { countdownText, status, time, stop }
}
