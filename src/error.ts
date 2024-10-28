export function ensureError<E>(error: E): Error {
    return error instanceof Error ? error : new Error(String(error))
}

export function prefixError(prefix: string | undefined, error: Error): Error {
    if (prefix) {
        error.message = `${prefix}: ${error.message}`
    }
    return error
}
