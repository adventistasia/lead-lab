import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/passkeys/login/options',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
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
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/passkeys/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const PasskeyLoginController = { index, store }

export default PasskeyLoginController