import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
export const store = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/questions/{sessionQuestion}/answers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
store.url = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sessionQuestion: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sessionQuestion: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sessionQuestion: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sessionQuestion: typeof args.sessionQuestion === 'object'
        ? args.sessionQuestion.id
        : args.sessionQuestion,
    }

    return store.definition.url
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
store.post = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
const storeForm = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::store
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
storeForm.post = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\SessionQnaController::update
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
export const update = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/questions/{sessionQuestion}/answers/{sessionAnswer}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\SessionQnaController::update
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
update.url = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            sessionQuestion: args[0],
            sessionAnswer: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sessionQuestion: typeof args.sessionQuestion === 'object'
        ? args.sessionQuestion.id
        : args.sessionQuestion,
        sessionAnswer: typeof args.sessionAnswer === 'object'
        ? args.sessionAnswer.id
        : args.sessionAnswer,
    }

    return update.definition.url
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace('{sessionAnswer}', parsedArgs.sessionAnswer.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::update
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
update.patch = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\SessionQnaController::update
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
const updateForm = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
updateForm.patch = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
export const destroy = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/questions/{sessionQuestion}/answers/{sessionAnswer}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SessionQnaController::destroy
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
destroy.url = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            sessionQuestion: args[0],
            sessionAnswer: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sessionQuestion: typeof args.sessionQuestion === 'object'
        ? args.sessionQuestion.id
        : args.sessionQuestion,
        sessionAnswer: typeof args.sessionAnswer === 'object'
        ? args.sessionAnswer.id
        : args.sessionAnswer,
    }

    return destroy.definition.url
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace('{sessionAnswer}', parsedArgs.sessionAnswer.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::destroy
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
destroy.delete = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SessionQnaController::destroy
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
const destroyForm = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
destroyForm.delete = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const answers = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default answers