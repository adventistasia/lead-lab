/**
 * Base error class for passkey operations.
 */
export declare class PasskeyError extends Error {
    constructor(message: string);
}
/**
 * Thrown when the browser doesn't support WebAuthn.
 */
export declare class NotSupportedError extends PasskeyError {
    constructor();
}
/**
 * Thrown when the user cancels the passkey operation.
 */
export declare class UserCancelledError extends PasskeyError {
    constructor();
}
/**
 * Thrown when the passkey already exists (during registration).
 */
export declare class PasskeyExistsError extends PasskeyError {
    constructor();
}
/**
 * Thrown when passkeys are used from an invalid domain.
 */
export declare class InvalidDomainError extends PasskeyError {
    constructor(domain?: string);
}
/**
 * Convert WebAuthn errors to friendly passkey errors.
 */
export declare const toPasskeyError: (error: unknown) => PasskeyError;
