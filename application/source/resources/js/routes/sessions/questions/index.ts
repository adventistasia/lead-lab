import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
export const store = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/sessions/{learningSession}/questions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
store.url = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { learningSession: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { learningSession: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            learningSession: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        learningSession: typeof args.learningSession === 'object'
        ? args.learningSession.id
        : args.learningSession,
    }

    return store.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
store.post = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
const storeForm = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
storeForm.post = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\SessionQnaController::update
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
export const update = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/sessions/{learningSession}/questions/{sessionQuestion}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\SessionQnaController::update
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
update.url = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            learningSession: args[0],
            sessionQuestion: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        learningSession: typeof args.learningSession === 'object'
        ? args.learningSession.id
        : args.learningSession,
        sessionQuestion: typeof args.sessionQuestion === 'object'
        ? args.sessionQuestion.id
        : args.sessionQuestion,
    }

    return update.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::update
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
update.patch = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\SessionQnaController::update
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
const updateForm = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::update
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
updateForm.patch = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\SessionQnaController::destroy
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
export const destroy = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/sessions/{learningSession}/questions/{sessionQuestion}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SessionQnaController::destroy
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
destroy.url = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            learningSession: args[0],
            sessionQuestion: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        learningSession: typeof args.learningSession === 'object'
        ? args.learningSession.id
        : args.learningSession,
        sessionQuestion: typeof args.sessionQuestion === 'object'
        ? args.sessionQuestion.id
        : args.sessionQuestion,
    }

    return destroy.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::destroy
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
destroy.delete = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SessionQnaController::destroy
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
const destroyForm = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::destroy
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
destroyForm.delete = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const questions = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default questions