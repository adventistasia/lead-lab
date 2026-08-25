import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import questions from './questions'
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

const sessions = {
    show: Object.assign(show, show),
    questions: Object.assign(questions, questions),
}

export default sessions