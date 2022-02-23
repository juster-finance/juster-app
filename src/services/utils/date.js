import { Duration } from "luxon"

export const countdown = ({ target, now }) => {
    const distance = target - now

    return {
        d: Math.floor(
            (distance % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24),
        ),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
        distance,
    }
}

export const toReadableDuration = ({ seconds, asObject }) => {
    const dur = Duration.fromObject({ seconds })

    if (!asObject) {
        if (dur.as("hours") < 1) {
            return `${dur.as("minutes")}m`
        } else if (dur.as("hours") > 24) {
            return `${dur.as("days")}d`
        } else {
            return `${dur.as("hours")}h`
        }
    } else {
        if (dur.as("hours") < 1) {
            return {
                val: dur.as("minutes"),
                text: "minute",
            }
        } else if (dur.as("hours") > 24) {
            return {
                val: dur.as("days"),
                text: "day",
            }
        } else {
            return {
                val: dur.as("hours"),
                text: "hour",
            }
        }
    }
}
