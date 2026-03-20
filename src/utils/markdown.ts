/**
 * Lightweight markdown-to-HTML parser for chat messages.
 * Covers: headings, bold, italic, inline code, code blocks,
 * unordered/ordered lists, links, and paragraphs.
 *
 * Input is sanitized (HTML tags stripped) before parsing to
 * prevent XSS when rendered via dangerouslySetInnerHTML.
 */

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function parseInline(text: string): string {
    return (
        text
            // inline code (must come before bold/italic to avoid conflicts)
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // bold + italic
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            // bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // italic
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    );
}

export function renderMarkdown(src: string): string {
    // Sanitise: escape all HTML so only our generated markup is rendered
    const escaped = escapeHtml(src);

    const lines = escaped.split('\n');
    const out: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code block
        if (line.trimStart().startsWith('```')) {
            const codeLines: string[] = [];
            i++; // skip opening fence
            while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++; // skip closing fence
            out.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
            continue;
        }

        // Headings
        const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            out.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
            i++;
            continue;
        }

        // Unordered list
        if (/^\s*[-*+]\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
                i++;
            }
            out.push('<ul>' + items.map((item) => `<li>${parseInline(item)}</li>`).join('') + '</ul>');
            continue;
        }

        // Ordered list
        if (/^\s*\d+[.)]\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
                i++;
            }
            out.push('<ol>' + items.map((item) => `<li>${parseInline(item)}</li>`).join('') + '</ol>');
            continue;
        }

        // Blank line
        if (line.trim() === '') {
            i++;
            continue;
        }

        // Paragraph (collect consecutive non-empty lines)
        const paraLines: string[] = [];
        while (
            i < lines.length &&
            lines[i].trim() !== '' &&
            !lines[i].trimStart().startsWith('```') &&
            !/^#{1,6}\s+/.test(lines[i]) &&
            !/^\s*[-*+]\s+/.test(lines[i]) &&
            !/^\s*\d+[.)]\s+/.test(lines[i])
        ) {
            paraLines.push(lines[i]);
            i++;
        }
        out.push(`<p>${parseInline(paraLines.join(' '))}</p>`);
    }

    return out.join('');
}
