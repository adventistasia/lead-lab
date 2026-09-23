import type { ReactNode } from 'react';

const renderInline = (value: string, keyPrefix: string): ReactNode[] => {
    const tokenPattern =
        /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s]+)/g;
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let tokenIndex = 0;

    while ((match = tokenPattern.exec(value)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(value.slice(lastIndex, match.index));
        }

        const token = match[0];
        const key = `${keyPrefix}-${tokenIndex}`;
        tokenIndex += 1;

        if (token.startsWith('**')) {
            nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
        } else if (token.startsWith('*')) {
            nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
        } else if (token.startsWith('[')) {
            const linkMatch = token.match(
                /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/,
            );

            if (linkMatch !== null) {
                nodes.push(
                    <a
                        key={key}
                        href={linkMatch[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand-green-dark underline underline-offset-4 dark:text-brand-yellow"
                    >
                        {linkMatch[1]}
                    </a>,
                );
            } else {
                nodes.push(token);
            }
        } else {
            nodes.push(
                <a
                    key={key}
                    href={token}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-green-dark underline underline-offset-4 dark:text-brand-yellow"
                >
                    {token}
                </a>,
            );
        }

        lastIndex = match.index + token.length;
    }

    if (lastIndex < value.length) {
        nodes.push(value.slice(lastIndex));
    }

    return nodes;
};

export function AnnouncementMarkdownPreview({ body }: { body: string }) {
    const elements: ReactNode[] = [];
    const paragraphs: string[] = [];
    let listType: 'ordered' | 'unordered' | null = null;
    let listItems: string[] = [];

    const flushParagraph = () => {
        if (paragraphs.length === 0) {
            return;
        }

        elements.push(
            <p key={`paragraph-${elements.length}`}>
                {renderInline(
                    paragraphs.join(' '),
                    `paragraph-${elements.length}`,
                )}
            </p>,
        );
        paragraphs.length = 0;
    };

    const flushList = () => {
        if (listType === null || listItems.length === 0) {
            listType = null;
            listItems = [];

            return;
        }

        const List = listType === 'ordered' ? 'ol' : 'ul';
        elements.push(
            <List
                key={`list-${elements.length}`}
                className={
                    listType === 'ordered' ? 'list-decimal' : 'list-disc'
                }
            >
                {listItems.map((item, index) => (
                    <li key={`${item}-${index}`}>
                        {renderInline(item, `list-${elements.length}-${index}`)}
                    </li>
                ))}
            </List>,
        );
        listType = null;
        listItems = [];
    };

    body.split(/\r?\n/).forEach((line, index) => {
        const heading = line.match(/^(#{1,3})\s+(.+)$/);
        const unorderedItem = line.match(/^[-*]\s+(.+)$/);
        const orderedItem = line.match(/^\d+\.\s+(.+)$/);

        if (line.trim() === '') {
            flushParagraph();
            flushList();

            return;
        }

        if (heading !== null) {
            flushParagraph();
            flushList();
            const Heading =
                heading[1].length === 1
                    ? 'h2'
                    : heading[1].length === 2
                      ? 'h3'
                      : 'h4';
            elements.push(
                <Heading key={`heading-${index}`}>
                    {renderInline(heading[2], `heading-${index}`)}
                </Heading>,
            );

            return;
        }

        if (unorderedItem !== null || orderedItem !== null) {
            flushParagraph();
            const nextListType =
                unorderedItem === null ? 'ordered' : 'unordered';

            if (listType !== nextListType) {
                flushList();
                listType = nextListType;
            }

            listItems.push((unorderedItem ?? orderedItem)?.[1] ?? '');

            return;
        }

        flushList();
        paragraphs.push(line.trim());
    });

    flushParagraph();
    flushList();

    return <div className="announcement-preview">{elements}</div>;
}
