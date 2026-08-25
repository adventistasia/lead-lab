import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\LearningSessionController::index
* @see app/Http/Controllers/LearningSessionController.php:14
* @route '/classroom'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/classroom',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LearningSessionController::index
* @see app/Http/Controllers/LearningSessionController.php:14
* @route '/classroom'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LearningSessionController::index
* @see app/Http/Controllers/LearningSessionController.php:14
* @route '/classroom'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LearningSessionController::index
* @see app/Http/Controllers/LearningSessionController.php:14
* @route '/classroom'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\LearningSessionController::index
* @see app/Http/Controllers/LearningSessionController.php:14
* @route '/classroom'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LearningSessionController::index
* @see app/Http/Controllers/LearningSessionController.php:14
* @route '/classroom'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LearningSessionController::index
* @see app/Http/Controllers/LearningSessionController.php:14
* @route '/classroom'
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
* @see \App\Http\Controllers\LearningSessionController::show
* @see app/Http/Controllers/LearningSessionController.php:66
* @route '/sessions/{learningSession}'
*/
export const show = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/sessions/{learningSession}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LearningSessionController::show
* @see app/Http/Controllers/LearningSessionController.php:66
* @route '/sessions/{learningSession}'
*/
show.url = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LearningSessionController::show
* @see app/Http/Controllers/LearningSessionController.php:66
* @route '/sessions/{learningSession}'
*/
show.get = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LearningSessionController::show
* @see app/Http/Controllers/LearningSessionController.php:66
* @route '/sessions/{learningSession}'
*/
show.head = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\LearningSessionController::show
* @see app/Http/Controllers/LearningSessionController.php:66
* @route '/sessions/{learningSession}'
*/
const showForm = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LearningSessionController::show
* @see app/Http/Controllers/LearningSessionController.php:66
* @route '/sessions/{learningSession}'
*/
showForm.get = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LearningSessionController::show
* @see app/Http/Controllers/LearningSessionController.php:66
* @route '/sessions/{learningSession}'
*/
showForm.head = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const LearningSessionController = { index, show }

export default LearningSessionController