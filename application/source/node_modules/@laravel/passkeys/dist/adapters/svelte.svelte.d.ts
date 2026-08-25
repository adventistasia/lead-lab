import { PasskeyError } from '../errors';
import { RegisterRouteOptions, VerifyResponse, VerifyRouteOptions } from '../types';
type UsePasskeyVerifyOptions = VerifyRouteOptions & {
    autofill?: boolean;
    onSuccess?: (response: VerifyResponse) => void;
    onError?: (error: PasskeyError) => void;
};
type UsePasskeyRegisterOptions = RegisterRouteOptions & {
    onSuccess?: () => void;
    onError?: (error: PasskeyError) => void;
};
export declare function usePasskeyVerify({ autofill, routes, onSuccess, onError, }?: UsePasskeyVerifyOptions): {
    verify: () => Promise<void>;
    readonly isLoading: boolean;
    readonly error: string | null;
    readonly errorInstance: PasskeyError | null;
    readonly isSupported: boolean;
};
export declare function usePasskeyRegister({ routes, onSuccess, onError, }?: UsePasskeyRegisterOptions): {
    register: (name: string) => Promise<void>;
    readonly isLoading: boolean;
    readonly error: string | null;
    readonly errorInstance: PasskeyError | null;
    readonly isSupported: boolean;
};
export {};
