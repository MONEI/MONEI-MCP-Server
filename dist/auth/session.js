const stateStore = new Map();
const STATE_TTL_MS = 10 * 60 * 1000;
export function createState(state) {
    stateStore.set(state, { createdAt: Date.now(), consumed: false });
}
export function validateAndConsumeState(state) {
    const entry = stateStore.get(state);
    if (!entry || entry.consumed)
        return false;
    if (Date.now() - entry.createdAt > STATE_TTL_MS) {
        stateStore.delete(state);
        return false;
    }
    entry.consumed = true;
    stateStore.delete(state);
    return true;
}
export function cleanupExpiredStates() {
    const now = Date.now();
    for (const [key, entry] of stateStore) {
        if (now - entry.createdAt > STATE_TTL_MS)
            stateStore.delete(key);
    }
}
//# sourceMappingURL=session.js.map