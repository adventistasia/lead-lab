import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SessionQnaController::storeQuestion
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
export const storeQuestion = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeQuestion.url(args, options),
    method: 'post',
})

storeQuestion.definition = {
    methods: ["post"],
    url: '/sessions/{learningSession}/questions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionQnaController::storeQuestion
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
storeQuestion.url = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return storeQuestion.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::storeQuestion
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
storeQuestion.post = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeQuestion.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::storeQuestion
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
const storeQuestionForm = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeQuestion.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::storeQuestion
* @see app/Http/Controllers/SessionQnaController.php:16
* @route '/sessions/{learningSession}/questions'
*/
storeQuestionForm.post = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeQuestion.url(args, options),
    method: 'post',
})

storeQuestion.form = storeQuestionForm

/**
* @see \App\Http\Controllers\SessionQnaController::updateQuestion
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
export const updateQuestion = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateQuestion.url(args, options),
    method: 'patch',
})

updateQuestion.definition = {
    methods: ["patch"],
    url: '/sessions/{learningSession}/questions/{sessionQuestion}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\SessionQnaController::updateQuestion
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
updateQuestion.url = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return updateQuestion.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::updateQuestion
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
updateQuestion.patch = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateQuestion.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\SessionQnaController::updateQuestion
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
const updateQuestionForm = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateQuestion.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::updateQuestion
* @see app/Http/Controllers/SessionQnaController.php:34
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
updateQuestionForm.patch = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateQuestion.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateQuestion.form = updateQuestionForm

/**
* @see \App\Http\Controllers\SessionQnaController::destroyQuestion
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
export const destroyQuestion = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyQuestion.url(args, options),
    method: 'delete',
})

destroyQuestion.definition = {
    methods: ["delete"],
    url: '/sessions/{learningSession}/questions/{sessionQuestion}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SessionQnaController::destroyQuestion
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
destroyQuestion.url = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return destroyQuestion.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::destroyQuestion
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
destroyQuestion.delete = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyQuestion.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SessionQnaController::destroyQuestion
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
const destroyQuestionForm = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyQuestion.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::destroyQuestion
* @see app/Http/Controllers/SessionQnaController.php:57
* @route '/sessions/{learningSession}/questions/{sessionQuestion}'
*/
destroyQuestionForm.delete = (args: { learningSession: number | { id: number }, sessionQuestion: number | { id: number } } | [learningSession: number | { id: number }, sessionQuestion: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyQuestion.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyQuestion.form = destroyQuestionForm

/**
* @see \App\Http\Controllers\SessionQnaController::storeAnswer
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
export const storeAnswer = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeAnswer.url(args, options),
    method: 'post',
})

storeAnswer.definition = {
    methods: ["post"],
    url: '/questions/{sessionQuestion}/answers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionQnaController::storeAnswer
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
storeAnswer.url = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return storeAnswer.definition.url
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::storeAnswer
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
storeAnswer.post = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeAnswer.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::storeAnswer
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
const storeAnswerForm = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeAnswer.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::storeAnswer
* @see app/Http/Controllers/SessionQnaController.php:72
* @route '/questions/{sessionQuestion}/answers'
*/
storeAnswerForm.post = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeAnswer.url(args, options),
    method: 'post',
})

storeAnswer.form = storeAnswerForm

/**
* @see \App\Http\Controllers\SessionQnaController::updateAnswer
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
export const updateAnswer = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateAnswer.url(args, options),
    method: 'patch',
})

updateAnswer.definition = {
    methods: ["patch"],
    url: '/questions/{sessionQuestion}/answers/{sessionAnswer}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\SessionQnaController::updateAnswer
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
updateAnswer.url = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return updateAnswer.definition.url
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace('{sessionAnswer}', parsedArgs.sessionAnswer.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::updateAnswer
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
updateAnswer.patch = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateAnswer.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\SessionQnaController::updateAnswer
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
const updateAnswerForm = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateAnswer.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::updateAnswer
* @see app/Http/Controllers/SessionQnaController.php:89
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
updateAnswerForm.patch = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateAnswer.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateAnswer.form = updateAnswerForm

/**
* @see \App\Http\Controllers\SessionQnaController::destroyAnswer
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
export const destroyAnswer = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyAnswer.url(args, options),
    method: 'delete',
})

destroyAnswer.definition = {
    methods: ["delete"],
    url: '/questions/{sessionQuestion}/answers/{sessionAnswer}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SessionQnaController::destroyAnswer
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
destroyAnswer.url = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return destroyAnswer.definition.url
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace('{sessionAnswer}', parsedArgs.sessionAnswer.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::destroyAnswer
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
destroyAnswer.delete = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyAnswer.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SessionQnaController::destroyAnswer
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
const destroyAnswerForm = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyAnswer.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::destroyAnswer
* @see app/Http/Controllers/SessionQnaController.php:109
* @route '/questions/{sessionQuestion}/answers/{sessionAnswer}'
*/
destroyAnswerForm.delete = (args: { sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } } | [sessionQuestion: number | { id: number }, sessionAnswer: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyAnswer.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyAnswer.form = destroyAnswerForm

/**
* @see \App\Http\Controllers\SessionQnaController::toggleQuestionVote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
export const toggleQuestionVote = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleQuestionVote.url(args, options),
    method: 'post',
})

toggleQuestionVote.definition = {
    methods: ["post"],
    url: '/questions/{sessionQuestion}/vote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionQnaController::toggleQuestionVote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
toggleQuestionVote.url = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return toggleQuestionVote.definition.url
            .replace('{sessionQuestion}', parsedArgs.sessionQuestion.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::toggleQuestionVote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
toggleQuestionVote.post = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleQuestionVote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::toggleQuestionVote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
const toggleQuestionVoteForm = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleQuestionVote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::toggleQuestionVote
* @see app/Http/Controllers/SessionQnaController.php:125
* @route '/questions/{sessionQuestion}/vote'
*/
toggleQuestionVoteForm.post = (args: { sessionQuestion: number | { id: number } } | [sessionQuestion: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleQuestionVote.url(args, options),
    method: 'post',
})

toggleQuestionVote.form = toggleQuestionVoteForm

/**
* @see \App\Http\Controllers\SessionQnaController::toggleAnswerVote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
export const toggleAnswerVote = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleAnswerVote.url(args, options),
    method: 'post',
})

toggleAnswerVote.definition = {
    methods: ["post"],
    url: '/answers/{sessionAnswer}/vote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SessionQnaController::toggleAnswerVote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
toggleAnswerVote.url = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return toggleAnswerVote.definition.url
            .replace('{sessionAnswer}', parsedArgs.sessionAnswer.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SessionQnaController::toggleAnswerVote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
toggleAnswerVote.post = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleAnswerVote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::toggleAnswerVote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
const toggleAnswerVoteForm = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleAnswerVote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SessionQnaController::toggleAnswerVote
* @see app/Http/Controllers/SessionQnaController.php:143
* @route '/answers/{sessionAnswer}/vote'
*/
toggleAnswerVoteForm.post = (args: { sessionAnswer: number | { id: number } } | [sessionAnswer: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleAnswerVote.url(args, options),
    method: 'post',
})

toggleAnswerVote.form = toggleAnswerVoteForm

const SessionQnaController = { storeQuestion, updateQuestion, destroyQuestion, storeAnswer, updateAnswer, destroyAnswer, toggleQuestionVote, toggleAnswerVote }

export default SessionQnaController