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
export declare const usePasskeyVerify: ({ autofill, routes, onSuccess, onError, }?: UsePasskeyVerifyOptions) => {
    verify: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    errorInstance: PasskeyError | null;
    isSupported: boolean;
};
export declare const usePasskeyRegister: ({ routes, onSuccess, onError, }?: UsePasskeyRegisterOptions) => {
    register: (name: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    errorInstance: PasskeyError | null;
    isSupported: boolean;
};
export {};
