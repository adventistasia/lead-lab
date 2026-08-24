import { router, useForm } from '@inertiajs/react';
import {
    ArrowUp,
    MessageCircle,
    Pencil,
    Plus,
    Send,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
type SessionQnaAuthor = {
    id: number;
    name: string;
    role: string;
};

export type SessionAnswer = {
    id: number;
    body: string;
    created_at: string;
    author: SessionQnaAuthor;
    votes_count: number;
    has_voted: boolean;
    can_edit: boolean;
    can_delete: boolean;
};

export type SessionQuestion = {
    id: number;
    title: string;
    details: string | null;
    created_at: string;
    author: SessionQnaAuthor;
    votes_count: number;
    has_voted: boolean;
    can_edit: boolean;
    can_delete: boolean;
    answers: SessionAnswer[];
};

type QuestionFormData = {
    title: string;
    details: string;
};

type AnswerFormData = {
    body: string;
};

const formatDate = (value: string): string =>
    new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));

const initials = (name: string): string =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

const roleLabel = (role: string): string => {
    if (role === 'admin') {
        return 'Administrator';
    }

    return role === 'moderator' ? 'Moderator' : 'Participant';
};

function FormErrors({ message }: { message?: string }) {
    return message ? <FieldError errors={[{ message }]} /> : null;
}

export function SessionQna({
    sessionId,
    questions,
}: {
    sessionId: number;
    questions: SessionQuestion[];
}) {
    const [answeringQuestionId, setAnsweringQuestionId] = useState<
        number | null
    >(null);
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
        null,
    );
    const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
    const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
    const questionForm = useForm<QuestionFormData>({
        title: '',
        details: '',
    });
    const answerForm = useForm<AnswerFormData>({ body: '' });
    const editQuestionForm = useForm<QuestionFormData>({
        title: '',
        details: '',
    });
    const editAnswerForm = useForm<AnswerFormData>({ body: '' });

    const toggleQuestionForm = () => {
        if (isQuestionFormOpen) {
            questionForm.reset();
            questionForm.clearErrors();
        }

        setIsQuestionFormOpen((open) => !open);
    };

    const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        questionForm.post(`/sessions/${sessionId}/questions`, {
            preserveScroll: true,
            onSuccess: () => {
                questionForm.reset();
                questionForm.clearErrors();
                setIsQuestionFormOpen(false);
            },
        });
    };

    const submitAnswer = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (answeringQuestionId === null) {
            return;
        }

        answerForm.post(`/questions/${answeringQuestionId}/answers`, {
            preserveScroll: true,
            onSuccess: () => {
                answerForm.reset();
                answerForm.clearErrors();
                setAnsweringQuestionId(null);
            },
        });
    };

    const startEditingQuestion = (question: SessionQuestion) => {
        editQuestionForm.setData({
            title: question.title,
            details: question.details ?? '',
        });
        editQuestionForm.clearErrors();
        setEditingQuestionId(question.id);
    };

    const submitQuestionEdit = (
        event: FormEvent<HTMLFormElement>,
        questionId: number,
    ) => {
        event.preventDefault();
        editQuestionForm.patch(
            `/sessions/${sessionId}/questions/${questionId}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    editQuestionForm.clearErrors();
                    setEditingQuestionId(null);
                },
            },
        );
    };

    const startEditingAnswer = (answer: SessionAnswer) => {
        editAnswerForm.setData('body', answer.body);
        editAnswerForm.clearErrors();
        setEditingAnswerId(answer.id);
    };

    const submitAnswerEdit = (
        event: FormEvent<HTMLFormElement>,
        questionId: number,
        answerId: number,
    ) => {
        event.preventDefault();
        editAnswerForm.patch(`/questions/${questionId}/answers/${answerId}`, {
            preserveScroll: true,
            onSuccess: () => {
                editAnswerForm.clearErrors();
                setEditingAnswerId(null);
            },
        });
    };

    const deleteQuestion = (question: SessionQuestion) => {
        if (!window.confirm(`Delete "${question.title}"?`)) {
            return;
        }

        router.delete(`/sessions/${sessionId}/questions/${question.id}`, {
            preserveScroll: true,
        });
    };

    const deleteAnswer = (questionId: number, answer: SessionAnswer) => {
        if (!window.confirm('Delete this answer?')) {
            return;
        }

        router.delete(`/questions/${questionId}/answers/${answer.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
                <h2 className="font-semibold">Questions and answers</h2>
                <p className="text-sm text-muted-foreground">
                    Ask the group, share an answer, or upvote something useful.
                </p>
            </div>

            <Button
                type="button"
                variant={isQuestionFormOpen ? 'outline' : 'default'}
                className="w-full"
                onClick={toggleQuestionForm}
                disabled={questionForm.processing}
            >
                {isQuestionFormOpen ? (
                    <X data-icon="inline-start" />
                ) : (
                    <Plus data-icon="inline-start" />
                )}
                {isQuestionFormOpen ? 'Close question form' : 'Ask a question'}
            </Button>

            {isQuestionFormOpen && (
                <form
                    onSubmit={submitQuestion}
                    className="flex flex-col gap-4 rounded-lg border bg-muted/20 p-4"
                >
                    <FieldGroup className="gap-4">
                        <Field
                            data-invalid={Boolean(questionForm.errors.title)}
                        >
                            <FieldLabel htmlFor="question-title">
                                Ask a question
                            </FieldLabel>
                            <Input
                                id="question-title"
                                value={questionForm.data.title}
                                onChange={(event) =>
                                    questionForm.setData(
                                        'title',
                                        event.target.value,
                                    )
                                }
                                aria-invalid={Boolean(
                                    questionForm.errors.title,
                                )}
                                placeholder="What would you like to explore?"
                                maxLength={160}
                            />
                            <FormErrors message={questionForm.errors.title} />
                        </Field>
                        <Field
                            data-invalid={Boolean(questionForm.errors.details)}
                        >
                            <FieldLabel htmlFor="question-details">
                                Details{' '}
                                <span className="font-normal">(optional)</span>
                            </FieldLabel>
                            <Textarea
                                id="question-details"
                                value={questionForm.data.details}
                                onChange={(event) =>
                                    questionForm.setData(
                                        'details',
                                        event.target.value,
                                    )
                                }
                                aria-invalid={Boolean(
                                    questionForm.errors.details,
                                )}
                                placeholder="Add context so others can give a useful answer."
                                maxLength={5000}
                            />
                            <FieldDescription>
                                Keep the conversation specific to this session.
                            </FieldDescription>
                            <FormErrors message={questionForm.errors.details} />
                        </Field>
                    </FieldGroup>
                    <Button
                        type="submit"
                        className="w-fit"
                        disabled={questionForm.processing}
                    >
                        <Send data-icon="inline-start" />
                        Post question
                    </Button>
                </form>
            )}

            {questions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="font-medium">No questions yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Start the conversation for this session.
                    </p>
                </div>
            ) : (
                <div className="flex max-h-[32rem] min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain pr-2">
                    {questions.map((question) => (
                        <article
                            key={question.id}
                            className="flex flex-col gap-4 rounded-lg border p-4"
                        >
                            {editingQuestionId === question.id ? (
                                <form
                                    onSubmit={(event) =>
                                        submitQuestionEdit(event, question.id)
                                    }
                                    className="flex flex-col gap-4"
                                >
                                    <FieldGroup className="gap-4">
                                        <Field
                                            data-invalid={Boolean(
                                                editQuestionForm.errors.title,
                                            )}
                                        >
                                            <FieldLabel
                                                htmlFor={`edit-question-title-${question.id}`}
                                            >
                                                Question title
                                            </FieldLabel>
                                            <Input
                                                id={`edit-question-title-${question.id}`}
                                                value={
                                                    editQuestionForm.data.title
                                                }
                                                onChange={(event) =>
                                                    editQuestionForm.setData(
                                                        'title',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={Boolean(
                                                    editQuestionForm.errors
                                                        .title,
                                                )}
                                                maxLength={160}
                                            />
                                            <FormErrors
                                                message={
                                                    editQuestionForm.errors
                                                        .title
                                                }
                                            />
                                        </Field>
                                        <Field
                                            data-invalid={Boolean(
                                                editQuestionForm.errors.details,
                                            )}
                                        >
                                            <FieldLabel
                                                htmlFor={`edit-question-details-${question.id}`}
                                            >
                                                Details
                                            </FieldLabel>
                                            <Textarea
                                                id={`edit-question-details-${question.id}`}
                                                value={
                                                    editQuestionForm.data
                                                        .details
                                                }
                                                onChange={(event) =>
                                                    editQuestionForm.setData(
                                                        'details',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={Boolean(
                                                    editQuestionForm.errors
                                                        .details,
                                                )}
                                                maxLength={5000}
                                            />
                                            <FormErrors
                                                message={
                                                    editQuestionForm.errors
                                                        .details
                                                }
                                            />
                                        </Field>
                                    </FieldGroup>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={
                                                editQuestionForm.processing
                                            }
                                        >
                                            Save changes
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setEditingQuestionId(null)
                                            }
                                        >
                                            <X data-icon="inline-start" />
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="flex items-start gap-3">
                                        <Avatar className="size-9">
                                            <AvatarFallback>
                                                {initials(question.author.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <p className="font-medium">
                                                    {question.author.name}
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {roleLabel(
                                                        question.author.role,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    question.created_at,
                                                )}
                                            </p>
                                        </div>
                                        {(question.can_edit ||
                                            question.can_delete) && (
                                            <div className="flex shrink-0 gap-1">
                                                {question.can_edit && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        aria-label="Edit question"
                                                        onClick={() =>
                                                            startEditingQuestion(
                                                                question,
                                                            )
                                                        }
                                                    >
                                                        <Pencil data-icon="inline-start" />
                                                    </Button>
                                                )}
                                                {question.can_delete && (
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        aria-label="Delete question"
                                                        onClick={() =>
                                                            deleteQuestion(
                                                                question,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 data-icon="inline-start" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h3 className="font-semibold">
                                            {question.title}
                                        </h3>
                                        {question.details && (
                                            <p className="text-sm leading-6 text-muted-foreground">
                                                {question.details}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={
                                        question.has_voted
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    aria-pressed={question.has_voted}
                                    onClick={() =>
                                        router.post(
                                            `/questions/${question.id}/vote`,
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <ArrowUp data-icon="inline-start" />
                                    {question.votes_count}
                                </Button>
                                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <MessageCircle data-icon="inline-start" />
                                    {question.answers.length}{' '}
                                    {question.answers.length === 1
                                        ? 'answer'
                                        : 'answers'}
                                </span>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="ml-auto"
                                    onClick={() => {
                                        answerForm.reset();
                                        answerForm.clearErrors();
                                        setAnsweringQuestionId(
                                            answeringQuestionId === question.id
                                                ? null
                                                : question.id,
                                        );
                                    }}
                                >
                                    {answeringQuestionId === question.id
                                        ? 'Close answer'
                                        : 'Answer'}
                                </Button>
                            </div>

                            {question.answers.length > 0 && (
                                <div className="flex flex-col gap-3 border-l-2 pl-4">
                                    {question.answers.map((answer) => (
                                        <div
                                            key={answer.id}
                                            className="flex flex-col gap-3 rounded-lg bg-muted/40 p-3"
                                        >
                                            {editingAnswerId === answer.id ? (
                                                <form
                                                    onSubmit={(event) =>
                                                        submitAnswerEdit(
                                                            event,
                                                            question.id,
                                                            answer.id,
                                                        )
                                                    }
                                                    className="flex flex-col gap-3"
                                                >
                                                    <Field
                                                        data-invalid={Boolean(
                                                            editAnswerForm
                                                                .errors.body,
                                                        )}
                                                    >
                                                        <FieldLabel
                                                            htmlFor={`edit-answer-${answer.id}`}
                                                        >
                                                            Edit answer
                                                        </FieldLabel>
                                                        <Textarea
                                                            id={`edit-answer-${answer.id}`}
                                                            value={
                                                                editAnswerForm
                                                                    .data.body
                                                            }
                                                            onChange={(event) =>
                                                                editAnswerForm.setData(
                                                                    'body',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            aria-invalid={Boolean(
                                                                editAnswerForm
                                                                    .errors
                                                                    .body,
                                                            )}
                                                            maxLength={5000}
                                                        />
                                                        <FormErrors
                                                            message={
                                                                editAnswerForm
                                                                    .errors.body
                                                            }
                                                        />
                                                    </Field>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            disabled={
                                                                editAnswerForm.processing
                                                            }
                                                        >
                                                            Save changes
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                setEditingAnswerId(
                                                                    null,
                                                                )
                                                            }
                                                        >
                                                            <X data-icon="inline-start" />
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="flex items-start gap-3">
                                                        <Avatar className="size-8">
                                                            <AvatarFallback>
                                                                {initials(
                                                                    answer
                                                                        .author
                                                                        .name,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                                <p className="text-sm font-medium">
                                                                    {
                                                                        answer
                                                                            .author
                                                                            .name
                                                                    }
                                                                </p>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatDate(
                                                                        answer.created_at,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap">
                                                                {answer.body}
                                                            </p>
                                                        </div>
                                                        {(answer.can_edit ||
                                                            answer.can_delete) && (
                                                            <div className="flex shrink-0 gap-1">
                                                                {answer.can_edit && (
                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        aria-label="Edit answer"
                                                                        onClick={() =>
                                                                            startEditingAnswer(
                                                                                answer,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil data-icon="inline-start" />
                                                                    </Button>
                                                                )}
                                                                {answer.can_delete && (
                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        aria-label="Delete answer"
                                                                        onClick={() =>
                                                                            deleteAnswer(
                                                                                question.id,
                                                                                answer,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 data-icon="inline-start" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={
                                                            answer.has_voted
                                                                ? 'secondary'
                                                                : 'ghost'
                                                        }
                                                        className="w-fit"
                                                        aria-pressed={
                                                            answer.has_voted
                                                        }
                                                        onClick={() =>
                                                            router.post(
                                                                `/answers/${answer.id}/vote`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <ArrowUp data-icon="inline-start" />
                                                        {answer.votes_count}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {answeringQuestionId === question.id && (
                                <form
                                    onSubmit={submitAnswer}
                                    className="flex flex-col gap-3 rounded-lg border bg-background p-3"
                                >
                                    <Field
                                        data-invalid={Boolean(
                                            answerForm.errors.body,
                                        )}
                                    >
                                        <FieldLabel
                                            htmlFor={`answer-${question.id}`}
                                        >
                                            Your answer
                                        </FieldLabel>
                                        <Textarea
                                            id={`answer-${question.id}`}
                                            value={answerForm.data.body}
                                            onChange={(event) =>
                                                answerForm.setData(
                                                    'body',
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(
                                                answerForm.errors.body,
                                            )}
                                            placeholder="Share a useful answer."
                                            maxLength={5000}
                                        />
                                        <FormErrors
                                            message={answerForm.errors.body}
                                        />
                                    </Field>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-fit"
                                        disabled={answerForm.processing}
                                    >
                                        <Send data-icon="inline-start" />
                                        Post answer
                                    </Button>
                                </form>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
