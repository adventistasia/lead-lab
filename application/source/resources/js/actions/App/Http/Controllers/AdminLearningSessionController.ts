import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AdminLearningSessionController::recordings
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
export const recordings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recordings.url(options),
    method: 'get',
})

recordings.definition = {
    methods: ["get","head"],
    url: '/admin/classroom',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::recordings
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
recordings.url = (options?: RouteQueryOptions) => {
    return recordings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::recordings
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
recordings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: recordings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::recordings
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
recordings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: recordings.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::recordings
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
const recordingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recordings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::recordings
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
recordingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recordings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::recordings
* @see app/Http/Controllers/AdminLearningSessionController.php:44
* @route '/admin/classroom'
*/
recordingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: recordings.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

recordings.form = recordingsForm

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:19
* @route '/admin/sessions'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/sessions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:19
* @route '/admin/sessions'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:19
* @route '/admin/sessions'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:19
* @route '/admin/sessions'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:19
* @route '/admin/sessions'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:19
* @route '/admin/sessions'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::index
* @see app/Http/Controllers/AdminLearningSessionController.php:19
* @route '/admin/sessions'
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
* @see \App\Http\Controllers\AdminLearningSessionController::edit
* @see app/Http/Controllers/AdminLearningSessionController.php:26
* @route '/admin/sessions/{learningSession}/edit'
*/
export const edit = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/sessions/{learningSession}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::edit
* @see app/Http/Controllers/AdminLearningSessionController.php:26
* @route '/admin/sessions/{learningSession}/edit'
*/
edit.url = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return edit.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::edit
* @see app/Http/Controllers/AdminLearningSessionController.php:26
* @route '/admin/sessions/{learningSession}/edit'
*/
edit.get = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::edit
* @see app/Http/Controllers/AdminLearningSessionController.php:26
* @route '/admin/sessions/{learningSession}/edit'
*/
edit.head = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::edit
* @see app/Http/Controllers/AdminLearningSessionController.php:26
* @route '/admin/sessions/{learningSession}/edit'
*/
const editForm = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::edit
* @see app/Http/Controllers/AdminLearningSessionController.php:26
* @route '/admin/sessions/{learningSession}/edit'
*/
editForm.get = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::edit
* @see app/Http/Controllers/AdminLearningSessionController.php:26
* @route '/admin/sessions/{learningSession}/edit'
*/
editForm.head = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\AdminLearningSessionController::store
* @see app/Http/Controllers/AdminLearningSessionController.php:79
* @route '/admin/sessions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/sessions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::store
* @see app/Http/Controllers/AdminLearningSessionController.php:79
* @route '/admin/sessions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::store
* @see app/Http/Controllers/AdminLearningSessionController.php:79
* @route '/admin/sessions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::store
* @see app/Http/Controllers/AdminLearningSessionController.php:79
* @route '/admin/sessions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::store
* @see app/Http/Controllers/AdminLearningSessionController.php:79
* @route '/admin/sessions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\AdminLearningSessionController::update
* @see app/Http/Controllers/AdminLearningSessionController.php:118
* @route '/admin/sessions/{learningSession}'
*/
export const update = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/admin/sessions/{learningSession}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::update
* @see app/Http/Controllers/AdminLearningSessionController.php:118
* @route '/admin/sessions/{learningSession}'
*/
update.url = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::update
* @see app/Http/Controllers/AdminLearningSessionController.php:118
* @route '/admin/sessions/{learningSession}'
*/
update.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::update
* @see app/Http/Controllers/AdminLearningSessionController.php:118
* @route '/admin/sessions/{learningSession}'
*/
const updateForm = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::update
* @see app/Http/Controllers/AdminLearningSessionController.php:118
* @route '/admin/sessions/{learningSession}'
*/
updateForm.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\AdminLearningSessionController::publish
* @see app/Http/Controllers/AdminLearningSessionController.php:154
* @route '/admin/sessions/{learningSession}/publish'
*/
export const publish = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: publish.url(args, options),
    method: 'patch',
})

publish.definition = {
    methods: ["patch"],
    url: '/admin/sessions/{learningSession}/publish',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::publish
* @see app/Http/Controllers/AdminLearningSessionController.php:154
* @route '/admin/sessions/{learningSession}/publish'
*/
publish.url = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return publish.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::publish
* @see app/Http/Controllers/AdminLearningSessionController.php:154
* @route '/admin/sessions/{learningSession}/publish'
*/
publish.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: publish.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::publish
* @see app/Http/Controllers/AdminLearningSessionController.php:154
* @route '/admin/sessions/{learningSession}/publish'
*/
const publishForm = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: publish.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::publish
* @see app/Http/Controllers/AdminLearningSessionController.php:154
* @route '/admin/sessions/{learningSession}/publish'
*/
publishForm.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: publish.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

publish.form = publishForm

/**
* @see \App\Http\Controllers\AdminLearningSessionController::unpublish
* @see app/Http/Controllers/AdminLearningSessionController.php:165
* @route '/admin/sessions/{learningSession}/unpublish'
*/
export const unpublish = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: unpublish.url(args, options),
    method: 'patch',
})

unpublish.definition = {
    methods: ["patch"],
    url: '/admin/sessions/{learningSession}/unpublish',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::unpublish
* @see app/Http/Controllers/AdminLearningSessionController.php:165
* @route '/admin/sessions/{learningSession}/unpublish'
*/
unpublish.url = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return unpublish.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::unpublish
* @see app/Http/Controllers/AdminLearningSessionController.php:165
* @route '/admin/sessions/{learningSession}/unpublish'
*/
unpublish.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: unpublish.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::unpublish
* @see app/Http/Controllers/AdminLearningSessionController.php:165
* @route '/admin/sessions/{learningSession}/unpublish'
*/
const unpublishForm = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unpublish.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::unpublish
* @see app/Http/Controllers/AdminLearningSessionController.php:165
* @route '/admin/sessions/{learningSession}/unpublish'
*/
unpublishForm.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unpublish.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

unpublish.form = unpublishForm

/**
* @see \App\Http\Controllers\AdminLearningSessionController::archive
* @see app/Http/Controllers/AdminLearningSessionController.php:176
* @route '/admin/sessions/{learningSession}/archive'
*/
export const archive = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: archive.url(args, options),
    method: 'patch',
})

archive.definition = {
    methods: ["patch"],
    url: '/admin/sessions/{learningSession}/archive',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::archive
* @see app/Http/Controllers/AdminLearningSessionController.php:176
* @route '/admin/sessions/{learningSession}/archive'
*/
archive.url = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return archive.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::archive
* @see app/Http/Controllers/AdminLearningSessionController.php:176
* @route '/admin/sessions/{learningSession}/archive'
*/
archive.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: archive.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::archive
* @see app/Http/Controllers/AdminLearningSessionController.php:176
* @route '/admin/sessions/{learningSession}/archive'
*/
const archiveForm = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: archive.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::archive
* @see app/Http/Controllers/AdminLearningSessionController.php:176
* @route '/admin/sessions/{learningSession}/archive'
*/
archiveForm.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: archive.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

archive.form = archiveForm

/**
* @see \App\Http\Controllers\AdminLearningSessionController::restore
* @see app/Http/Controllers/AdminLearningSessionController.php:187
* @route '/admin/sessions/{learningSession}/restore'
*/
export const restore = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: restore.url(args, options),
    method: 'patch',
})

restore.definition = {
    methods: ["patch"],
    url: '/admin/sessions/{learningSession}/restore',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\AdminLearningSessionController::restore
* @see app/Http/Controllers/AdminLearningSessionController.php:187
* @route '/admin/sessions/{learningSession}/restore'
*/
restore.url = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return restore.definition.url
            .replace('{learningSession}', parsedArgs.learningSession.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminLearningSessionController::restore
* @see app/Http/Controllers/AdminLearningSessionController.php:187
* @route '/admin/sessions/{learningSession}/restore'
*/
restore.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: restore.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::restore
* @see app/Http/Controllers/AdminLearningSessionController.php:187
* @route '/admin/sessions/{learningSession}/restore'
*/
const restoreForm = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: restore.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdminLearningSessionController::restore
* @see app/Http/Controllers/AdminLearningSessionController.php:187
* @route '/admin/sessions/{learningSession}/restore'
*/
restoreForm.patch = (args: { learningSession: number | { id: number } } | [learningSession: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: restore.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

restore.form = restoreForm

const AdminLearningSessionController = { recordings, index, edit, store, update, publish, unpublish, archive, restore }

export default AdminLearningSessionController