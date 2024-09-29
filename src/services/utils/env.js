export const getEnvVariable = (name) => {
    const value = process?.env?.[name] || import.meta?.env?.[name]
	if (value === undefined) {
        throw new Error(`Environment variable ${name} is not defined`)
	}
    return value
}
