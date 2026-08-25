import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import answers from './answers'
/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
export const vote = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: vote.url(args, options),
    method: 'post',
})

vote.definition = {
    methods: ["post"],
    url: '/questions/{sessionQuestion}/vote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
vote.url = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return vote.definition.url
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
vote.post = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: vote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
const voteForm = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: vote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::vote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
voteForm.post = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: vote.url(args, options),
    method: 'post',
})

vote.form = voteForm

const questions = {
    answers: Object.assign(answers, answers),
    vote: Object.assign(vote, vote),
}

export default questions