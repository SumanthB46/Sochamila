/**
 * Console Error Filter
 * Suppresses known, expected errors from triggering the Next.js dev error overlay.
 * Import this once in the root layout.
 */

const SUPPRESSED_PATTERNS: (string | RegExp)[] = [
    // Auth / registration expected errors
    /email already registered/i,
    /email already in use/i,
    /email is taken/i,
    /phone.*already/i,
    /aadhaar.*already/i,
    /pan.*already/i,
    /gst.*already/i,
    /invalid email or password/i,
    /password.*incorrect/i,
    /registration error/i,
    /registration failed/i,

    // Network errors that are caught and shown in UI
    /network error/i,
    /failed with status code 4/i,  // 4xx errors handled by UI
    /request failed with status code 40/i,

    // Known vendor/user validations
    /missing required fields/i,
    /unable to submit kyc/i,
];

function shouldSuppress(args: unknown[]): boolean {
    const message = args
        .map(a => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
    return SUPPRESSED_PATTERNS.some(pattern =>
        typeof pattern === "string"
            ? message.includes(pattern)
            : pattern.test(message)
    );
}

export function installConsoleFilter() {
    if (typeof window === "undefined") return; // server-side: skip

    const _originalError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
        if (shouldSuppress(args)) {
            // Downgrade to a warning so developer can still see it in console
            console.warn("[suppressed error]", ...args);
            return;
        }
        _originalError(...args);
    };
}
