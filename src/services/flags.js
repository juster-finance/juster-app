/** Vendor */
import { ref } from "vue"

/**
 * Services
 */
import { defaultFlags } from "@/services/default/flags"

export const flags = ref(null)

export const initFlags = () => {
	/** Init or Restore Integrity */
	if (!localStorage.getItem("flags")) {
		flags.value = defaultFlags
		localStorage.setItem("flags", JSON.stringify(defaultFlags))
	} else {
		flags.value = JSON.parse(localStorage.getItem("flags"))
	}

	/** restore missing flags */
	if (Object.keys(defaultFlags).length > Object.keys(flags.value).length) {
		Object.keys(defaultFlags).forEach((defaultFlag) => {
			if (flags.value[defaultFlag] === undefined) {
				flags.value[defaultFlag] = defaultFlags[defaultFlag]
			}
		})
		localStorage.setItem("flags", JSON.stringify(flags.value))
	}

	/** delete old flags */
	Object.keys(flags.value).forEach((flag) => {
		if (defaultFlags[flag] === undefined) {
			delete flags.value[flag]
		}
	})
	localStorage.setItem("flags", JSON.stringify(flags.value))
}

export const updateFlag = (target, value) => {
	if (!Object.prototype.hasOwnProperty.call(flags.value, target)) return

	flags.value[target] = value
	localStorage.setItem("flags", JSON.stringify(flags.value))
}
