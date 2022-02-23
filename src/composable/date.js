import { ref, watch, reactive } from "vue"

/**
 * Services
 */
import { countdown } from "@/services/utils/date"

export const useCountdown = target => {
    const countdownText = ref("00:00:00")
    const status = ref("In progress")
    const time = reactive({ d: 0, h: 0, m: 0 })

    let countdownInterval

    const start = () => {
        const { d, h, m, s, distance } = countdown({
            target: target.value,
            now: new Date().getTime(),
        })

        if (distance < 0) {
            status.value = "Finished"
            return { countdownText, status }
        }

        countdownText.value = `${h < 10 ? `0${h}` : h}:${
            m < 10 ? `0${m}` : m
        }:${s < 10 ? `0${s}` : s}`

        time.d = d
        time.h = h
        time.m = m

        countdownInterval = setInterval(() => {
            const now = new Date().getTime()
            const { d, h, m, s, distance } = countdown({
                target: target.value,
                now,
            })

            time.d = d
            time.h = h
            time.m = m

            if (distance < 0) {
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

    watch(target, () => start())
    if (target.value) start()

    return { countdownText, status, time, stop }
}
