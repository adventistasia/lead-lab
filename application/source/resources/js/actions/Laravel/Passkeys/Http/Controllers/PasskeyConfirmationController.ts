import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/passkeys/confirm/options',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/passkeys/confirm',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const PasskeyConfirmationController = { index, store }

export default PasskeyConfirmationController