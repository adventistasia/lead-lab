import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
export const vote = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: vote.url(args, options),
    method: 'post',
})

vote.definition = {
    methods: ["post"],
    url: '/answers/{sessionAnswer}/vote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
vote.url = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sessionAnswer: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sessionAnswer: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sessionAnswer: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sessionAnswer: typeof args.sessionAnswer === 'object'
        ? args.sessionAnswer.id
        : args.sessionAnswer,
    }

    return vote.definition.url
            .replace('{sessionAnswer}', parsedArgs.sessionAnswer.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
vote.post = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: vote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
const voteForm = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: vote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
voteForm.post = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: vote.url(args, options),
    method: 'post',
})

vote.form = voteForm

const answers = {
    vote: Object.assign(vote, vote),
}

export default answers