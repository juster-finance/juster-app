import amp from "amplitude-js"
import { juster } from "./juster"

const amplitude = amp.getInstance()

const log = (event, properties) => {
    amplitude.logEvent(event, { ...properties, network: juster.sdk._network })
}

export default { log }
