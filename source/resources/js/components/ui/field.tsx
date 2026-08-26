import { useMemo } from 'react';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="field-group"
            className={cn('flex w-full flex-col gap-6', className)}
            {...props}
        />
    );
}

const fieldVariants = cva('group/field flex w-full gap-3', {
    variants: {
        orientation: {
            vertical: 'flex-col [&>*]:w-full [&>.sr-only]:w-auto',
            horizontal: 'flex-row items-center [&>[data-slot=field-label]]:flex-auto',
        },
    },
    defaultVariants: {
        orientation: 'vertical',
    },
});

function Field({
    className,
    orientation = 'vertical',
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
    return (
        <div
            role="group"
            data-slot="field"
            className={cn(fieldVariants({ orientation }), className)}
            {...props}
        />
    );
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
    return (
        <Label
            data-slot="field-label"
            className={cn('leading-snug', className)}
            {...props}
        />
    );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="field-description"
            className={cn('text-sm leading-normal text-muted-foreground', className)}
            {...props}
        />
    );
}

function FieldError({
    className,
    children,
    errors,
    ...props
}: React.ComponentProps<'div'> & {
    errors?: Array<{ message?: string } | undefined>;
}) {
    const content = useMemo(() => {
        if (children) {
            return children;
        }

        const messages = errors?.map((error) => error?.message).filter(Boolean) ?? [];

        return [...new Set(messages)].join(', ');
    }, [children, errors]);

    if (!content) {
        return null;
    }

    return (
        <div
            role="alert"
            data-slot="field-error"
            className={cn('text-sm font-normal text-destructive', className)}
            {...props}
        >
            {content}
        </div>
    );
}

export { Field, FieldDescription, FieldError, FieldGroup, FieldLabel };
