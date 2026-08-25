import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\LearningResourceController::download
* @see app/Http/Controllers/LearningResourceController.php:12
* @route '/resources/{learningResource}/download'
*/
export const download = (args: { learningResource: number | { id: number } } | [learningResource: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/resources/{learningResource}/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LearningResourceController::download
* @see app/Http/Controllers/LearningResourceController.php:12
* @route '/resources/{learningResource}/download'
*/
download.url = (args: { learningResource: number | { id: number } } | [learningResource: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { learningResource: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { learningResource: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            learningResource: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        learningResource: typeof args.learningResource === 'object'
        ? args.learningResource.id
        : args.learningResource,
    }

    return download.definition.url
            .replace('{learningResource}', parsedArgs.learningResource.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\LearningResourceController::download
* @see app/Http/Controllers/LearningResourceController.php:12
* @route '/resources/{learningResource}/download'
*/
download.get = (args: { learningResource: number | { id: number } } | [learningResource: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LearningResourceController::download
* @see app/Http/Controllers/LearningResourceController.php:12
* @route '/resources/{learningResource}/download'
*/
download.head = (args: { learningResource: number | { id: number } } | [learningResource: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\LearningResourceController::download
* @see app/Http/Controllers/LearningResourceController.php:12
* @route '/resources/{learningResource}/download'
*/
const downloadForm = (args: { learningResource: number | { id: number } } | [learningResource: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LearningResourceController::download
* @see app/Http/Controllers/LearningResourceController.php:12
* @route '/resources/{learningResource}/download'
*/
downloadForm.get = (args: { learningResource: number | { id: number } } | [learningResource: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\LearningResourceController::download
* @see app/Http/Controllers/LearningResourceController.php:12
* @route '/resources/{learningResource}/download'
*/
downloadForm.head = (args: { learningResource: number | { id: number } } | [learningResource: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

download.form = downloadForm

const LearningResourceController = { download }

export default LearningResourceController