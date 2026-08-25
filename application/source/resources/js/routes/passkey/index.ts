import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::loginOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
export const loginOptions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loginOptions.url(options),
    method: 'get',
})

loginOptions.definition = {
    methods: ["get","head"],
    url: '/passkeys/login/options',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::loginOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
loginOptions.url = (options?: RouteQueryOptions) => {
    return loginOptions.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::loginOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
loginOptions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loginOptions.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::loginOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
loginOptions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: loginOptions.url(options),
    method: 'head',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::loginOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
const loginOptionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: loginOptions.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::loginOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
loginOptionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: loginOptions.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::loginOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:27
* @route '/passkeys/login/options'
*/
loginOptionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: loginOptions.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

loginOptions.form = loginOptionsForm

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::login
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/passkeys/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::login
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::login
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::login
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: login.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyLoginController::login
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyLoginController.php:43
* @route '/passkeys/login'
*/
loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: login.url(options),
    method: 'post',
})

login.form = loginForm

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirmOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
export const confirmOptions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirmOptions.url(options),
    method: 'get',
})

confirmOptions.definition = {
    methods: ["get","head"],
    url: '/passkeys/confirm/options',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirmOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
confirmOptions.url = (options?: RouteQueryOptions) => {
    return confirmOptions.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirmOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
confirmOptions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirmOptions.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirmOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
confirmOptions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: confirmOptions.url(options),
    method: 'head',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirmOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
const confirmOptionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: confirmOptions.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirmOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
confirmOptionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: confirmOptions.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirmOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:27
* @route '/passkeys/confirm/options'
*/
confirmOptionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: confirmOptions.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

confirmOptions.form = confirmOptionsForm

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirm
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
export const confirm = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(options),
    method: 'post',
})

confirm.definition = {
    methods: ["post"],
    url: '/passkeys/confirm',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirm
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
confirm.url = (options?: RouteQueryOptions) => {
    return confirm.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirm
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
confirm.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirm
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
const confirmForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyConfirmationController::confirm
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyConfirmationController.php:50
* @route '/passkeys/confirm'
*/
confirmForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(options),
    method: 'post',
})

confirm.form = confirmForm

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::registrationOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
export const registrationOptions = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: registrationOptions.url(options),
    method: 'get',
})

registrationOptions.definition = {
    methods: ["get","head"],
    url: '/user/passkeys/options',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::registrationOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
registrationOptions.url = (options?: RouteQueryOptions) => {
    return registrationOptions.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::registrationOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
registrationOptions.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: registrationOptions.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::registrationOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
registrationOptions.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: registrationOptions.url(options),
    method: 'head',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::registrationOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
const registrationOptionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: registrationOptions.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::registrationOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
registrationOptionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: registrationOptions.url(options),
    method: 'get',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::registrationOptions
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
registrationOptionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: registrationOptions.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

registrationOptions.form = registrationOptionsForm

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/user/passkeys',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
export const destroy = (args: { passkey: number | { id: number } } | [passkey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/user/passkeys/{passkey}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
destroy.url = (args: { passkey: number | { id: number } } | [passkey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { passkey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { passkey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            passkey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        passkey: typeof args.passkey === 'object'
        ? args.passkey.id
        : args.passkey,
    }

    return destroy.definition.url
            .replace('{passkey}', parsedArgs.passkey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
destroy.delete = (args: { passkey: number | { id: number } } | [passkey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
const destroyForm = (args: { passkey: number | { id: number } } | [passkey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
destroyForm.delete = (args: { passkey: number | { id: number } } | [passkey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const passkey = {
    loginOptions: Object.assign(loginOptions, loginOptions),
    login: Object.assign(login, login),
    confirmOptions: Object.assign(confirmOptions, confirmOptions),
    confirm: Object.assign(confirm, confirm),
    registrationOptions: Object.assign(registrationOptions, registrationOptions),
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default passkey