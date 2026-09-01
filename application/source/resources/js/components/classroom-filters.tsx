import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type ClassroomFilterValues = {
    search: string;
    season: string;
    date_from: string | null;
    date_to: string | null;
};

export function ClassroomFilters({
    action,
    seasons,
    filters,
}: {
    action: string;
    seasons: string[];
    filters: ClassroomFilterValues;
}) {
    const [search, setSearch] = useState(filters.search);
    const [season, setSeason] = useState(filters.season);
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const params: Record<string, string> = {};

        if (search.trim() !== '') {
            params.search = search.trim();
        }

        if (season !== '') {
            params.season = season;
        }

        if (dateFrom !== '') {
            params.date_from = dateFrom;
        }

        if (dateTo !== '') {
            params.date_to = dateTo;
        }

        router.get(action, params, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSeason('');
        setDateFrom('');
        setDateTo('');

        router.get(
            action,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const hasFilters =
        search.trim() !== '' ||
        season !== '' ||
        dateFrom !== '' ||
        dateTo !== '';
    const idPrefix = action.replaceAll('/', '-').replace(/^-+/, '');

    return (
        <form
            className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm"
            onSubmit={submit}
        >
            <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium">Find a session</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(12rem,0.8fr)_minmax(9rem,0.6fr)_minmax(9rem,0.6fr)]">
                <div className="flex flex-col gap-2">
                    <Label htmlFor={`${idPrefix}-search`}>Search</Label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id={`${idPrefix}-search`}
                            className="pl-9"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Title, description, or resource"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor={`${idPrefix}-season`}>Season</Label>
                    <Select
                        value={season || 'all'}
                        onValueChange={(value) =>
                            setSeason(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger
                            id={`${idPrefix}-season`}
                            className="w-full"
                        >
                            <SelectValue placeholder="All seasons" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All seasons</SelectItem>
                            {seasons.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor={`${idPrefix}-date-from`}>From</Label>
                    <Input
                        id={`${idPrefix}-date-from`}
                        type="date"
                        value={dateFrom}
                        onChange={(event) => setDateFrom(event.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor={`${idPrefix}-date-to`}>To</Label>
                    <Input
                        id={`${idPrefix}-date-to`}
                        type="date"
                        value={dateTo}
                        onChange={(event) => setDateTo(event.target.value)}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="submit">
                    <Search data-icon="inline-start" />
                    Apply filters
                </Button>
                {hasFilters ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={clearFilters}
                    >
                        <X data-icon="inline-start" />
                        Clear
                    </Button>
                ) : null}
            </div>
        </form>
    );
}
