import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see routes/web.php:15
* @route '/registration/pending'
*/
export const pending = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

pending.definition = {
    methods: ["get","head"],
    url: '/registration/pending',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:15
* @route '/registration/pending'
*/
pending.url = (options?: RouteQueryOptions) => {
    return pending.definition.url + queryParams(options)
}

/**
* @see routes/web.php:15
* @route '/registration/pending'
*/
pending.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: pending.url(options),
    method: 'get',
})

/**
* @see routes/web.php:15
* @route '/registration/pending'
*/
pending.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: pending.url(options),
    method: 'head',
})

/**
* @see routes/web.php:15
* @route '/registration/pending'
*/
const pendingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pending.url(options),
    method: 'get',
})

/**
* @see routes/web.php:15
* @route '/registration/pending'
*/
pendingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pending.url(options),
    method: 'get',
})

/**
* @see routes/web.php:15
* @route '/registration/pending'
*/
pendingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: pending.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

pending.form = pendingForm

const registration = {
    pending: Object.assign(pending, pending),
}

export default registration