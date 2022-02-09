import { Duration } from "luxon"

export const countdown = ({ target, now }) => {
    const distance = target - now

    return {
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
        d: distance,
    }
}

export const toReadableDuration = ({ seconds }) => {
    const dur = Duration.fromObject({ seconds })

    if (dur.as("hours") < 1) {
        return `${dur.as("minutes")}m`
    } else if (dur.as("hours") > 24) {
        return `${dur.as("days")}d`
    } else {
        return `${dur.as("hours")}h`
    }
}
