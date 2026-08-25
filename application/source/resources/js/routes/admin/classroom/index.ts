import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/classroom',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
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

const classroom = {
    index: Object.assign(index, index),
}

export default classroom