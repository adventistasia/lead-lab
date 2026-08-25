import { PasskeysConfig, RegisterOptions, RegistrationResponse, VerifyResponse, VerifyRouteOptions } from './types';
/**
 * Passkeys client for Laravel applications.
 */
export declare const Passkeys: {
    /**
     * Configure the passkeys client.
     */
    configure(config: PasskeysConfig): void;
    /**
     * Check if the browser supports passkeys.
     */
    isSupported(): boolean;
    /**
     * Check if the browser supports passkey autofill.
     */
    isAutofillSupported(): Promise<boolean>;
    /**
     * Register a new passkey for the authenticated user.
     */
    register(options: RegisterOptions): Promise<RegistrationResponse>;
    /**
     * Verify with a passkey.
     */
    verify(options?: VerifyRouteOptions): Promise<VerifyResponse>;
    /**
     * Enable passkey autofill on the current page.
     *
     * Note that the page must have an input with `autocomplete="email webauthn"` to
     * anchor the browser's passkey picker dropdown.
     *
     * Returns the verification response on success, or `undefined` if autofill
     * is not supported or was cancelled.
     */
    autofill(options?: VerifyRouteOptions): Promise<VerifyResponse | undefined>;
    /**
     * Cancel any pending passkey operation.
     */
    cancel(): void;
};
