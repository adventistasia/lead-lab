import { PasskeysConfig } from './types';
export declare const configure: (options: PasskeysConfig) => void;
export declare const resetConfig: () => void;
/**
 * Make a GET request to the Laravel backend.
 */
export declare const get: <T>(url: string) => Promise<T>;
/**
 * Make a POST request to the Laravel backend.
 */
export declare const post: <T>(url: string, data: unknown) => Promise<T>;
