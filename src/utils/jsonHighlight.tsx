import type React from 'react';

const TOKEN_REGEX =
  /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}[\],:]|[^\s"{}[\],:]+)/g;

export function renderHighlightedJson(jsonObjects: unknown[]): React.ReactNode[] {
  const displayObjects = jsonObjects.slice(0, 300);
  const raw = JSON.stringify(displayObjects, null, 2);
  const lines = raw.split('\n');

  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null = null;
    TOKEN_REGEX.lastIndex = 0;

    while (true) {
      match = TOKEN_REGEX.exec(line);
      if (match === null) break;
      if (match.index > lastIndex) {
        tokens.push(line.slice(lastIndex, match.index));
      }
      const val = match[0];
      const keyId = `${lineIdx}-${match.index}`;

      if (val.startsWith('"')) {
        if (val.endsWith(':')) {
          tokens.push(
            <span key={`${keyId}-k`} className="text-sky-400 font-medium">
              {val.slice(0, -1)}
            </span>
          );
          tokens.push(
            <span key={`${keyId}-c`} className="text-tx-muted/60">
              :
            </span>
          );
        } else {
          tokens.push(
            <span key={`${keyId}-s`} className="text-emerald-300">
              {val}
            </span>
          );
        }
      } else if (/^(?:true|false)$/.test(val)) {
        tokens.push(
          <span key={`${keyId}-b`} className="text-amber-400 font-semibold">
            {val}
          </span>
        );
      } else if (val === 'null') {
        tokens.push(
          <span key={`${keyId}-n`} className="text-rose-400/80 italic font-mono">
            {val}
          </span>
        );
      } else if (/^-?\d/.test(val)) {
        tokens.push(
          <span key={`${keyId}-num`} className="text-purple-300 font-mono">
            {val}
          </span>
        );
      } else if (/[{}[\],:]/.test(val)) {
        tokens.push(
          <span key={`${keyId}-p`} className="text-tx-muted/70">
            {val}
          </span>
        );
      } else {
        tokens.push(val);
      }
      lastIndex = TOKEN_REGEX.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push(line.slice(lastIndex));
    }

    return (
      <div key={`line-${lineIdx}`} className="leading-relaxed whitespace-pre font-mono text-xs">
        {tokens}
      </div>
    );
  });
}
