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
    isLoading: import('vue').Ref<boolean, boolean>;
    error: import('vue').Ref<string | null, string | null>;
    errorInstance: import('vue').Ref<PasskeyError | null, PasskeyError | null>;
    isSupported: import('vue').Ref<boolean, boolean>;
};
export declare const usePasskeyRegister: ({ routes, onSuccess, onError, }?: UsePasskeyRegisterOptions) => {
    register: (name: string) => Promise<void>;
    isLoading: import('vue').Ref<boolean, boolean>;
    error: import('vue').Ref<string | null, string | null>;
    errorInstance: import('vue').Ref<PasskeyError | null, PasskeyError | null>;
    isSupported: import('vue').Ref<boolean, boolean>;
};
export {};
