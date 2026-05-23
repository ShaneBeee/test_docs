import { SkElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BadgeCheck, Clock, Layers, ListTodo, Terminal, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ElementCardProps {
  element: SkElement;
  category: string;
}

// Simple Skript Syntax Highlighter based on the provided screenshot (VS Code Dark+ style)
function SkriptHighlighter({ code }: { code: string }) {
  // Define token patterns
  const tokens = [
    { type: 'comment', regex: /#.*$/gm, color: '#6A9955' },
    { type: 'string', regex: /"([^"\\]|\\.)*"/g, color: '#CE9178' },
    { type: 'keyword', regex: /\b(register|with id|set|to|loop|between|and|at|vector|within|from|add|remove|delete|is|has|contains)\b/g, color: '#569CD6' },
    { type: 'boolean', regex: /\b(true|false|yes|no|on|off)\b/g, color: '#569CD6' },
    { type: 'number', regex: /\b\d+(\.\d+)?\b/g, color: '#B5CEA8' },
    { type: 'variable', regex: /\{[^}]+\}/g, color: '#9CDCFE' },
    { type: 'section', regex: /^[ \t]*[^#\n]+:$/gm, color: '#D4D4D4', bold: true },
  ];

  const lines = code.split('\n');
  
  return (
    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-gray-800 flex font-mono text-sm shadow-xl">
      {/* Gutter / Line Numbers */}
      <div className="bg-[#1E1E1E] px-4 py-4 text-right select-none border-r border-gray-800/50 text-gray-600 min-w-[3.5rem]">
        {lines.map((_, i) => (
          <div key={i} className="leading-6 h-6">{i + 1}</div>
        ))}
      </div>
      
      {/* Code Area */}
      <div className="flex-1 overflow-x-auto p-4 py-4">
        <pre className="text-[#D4D4D4] leading-6">
          <code>
            {lines.map((line, lineIdx) => {
              let parts: { text: string; color?: string; bold?: boolean }[] = [{ text: line }];

              tokens.forEach(token => {
                const newParts: typeof parts = [];
                parts.forEach(part => {
                  if (part.color) {
                    newParts.push(part);
                    return;
                  }

                  let lastIndex = 0;
                  let match;
                  token.regex.lastIndex = 0;
                  
                  while ((match = token.regex.exec(part.text)) !== null) {
                    if (match.index > lastIndex) {
                      newParts.push({ text: part.text.substring(lastIndex, match.index) });
                    }
                    newParts.push({ 
                      text: match[0], 
                      color: token.color, 
                      bold: token.bold 
                    });
                    lastIndex = token.regex.lastIndex;
                    if (match[0].length === 0) token.regex.lastIndex++;
                  }
                  if (lastIndex < part.text.length) {
                    newParts.push({ text: part.text.substring(lastIndex) });
                  }
                });
                parts = newParts;
              });

              return (
                <div key={lineIdx} className="h-6 whitespace-pre">
                  {parts.map((part, partIdx) => (
                    <span 
                      key={partIdx} 
                      style={{ 
                        color: part.color, 
                        fontWeight: part.bold ? 'bold' : 'normal' 
                      }}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default function ElementCard({ element, category }: ElementCardProps) {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-orange-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-xl font-bold text-[var(--foreground)] group-hover:text-orange-600 transition-colors">
            {element.name}
          </h3>
          {element.since && element.since.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-md text-sm font-medium border border-orange-100 dark:border-orange-900/40 shrink-0">
              <Clock size={14} />
              {element.since[0]}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Pattern */}
          {element.patterns && element.patterns.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-2">
                <Terminal size={14} className="text-orange-500" />
                Pattern
              </span>
              <div className="bg-[#1e1e2e] p-4 rounded-xl border border-slate-800 font-mono text-sm shadow-inner overflow-x-auto">
                {element.patterns.map((pattern, idx) => {
                  let displayPattern = pattern;
                  const hasEntries = (category === 'structures' || category === 'expressions' || category === 'sections') && element.entries && element.entries.length > 0;
                  
                  if (hasEntries && !displayPattern.endsWith(':')) {
                    displayPattern += ':';
                  }

                  return (
                    <div key={idx} className="mb-3 last:mb-0">
                      <div className="text-orange-400 font-bold">{displayPattern}</div>
                      {hasEntries && element.entries?.map((entry, eIdx) => (
                        <div key={eIdx} className="pl-6 mt-1 flex items-baseline gap-2">
                          <span className="text-slate-300">{entry.name}:</span>
                          <span className="text-green-400 italic text-xs"># {entry.isRequired ? 'Required' : 'Optional'} {entry.isSection ? 'code' : 'value'}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {element.description && element.description.length > 0 && (
            <div>
               <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-2">
                 <FileText size={14} className="text-blue-400" />
                 Description
               </span>
               <div className="text-[var(--foreground)] text-sm leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded text-orange-600 dark:text-orange-400 font-mono text-xs" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-extrabold text-[var(--foreground)]" {...props} />,
                      a: ({node, ...props}) => <a className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-bold underline decoration-orange-200 dark:decoration-orange-900/40 underline-offset-2 transition-colors" {...props} />,
                    }}
                  >
                    {element.description.join('\n\n')}
                  </ReactMarkdown>
               </div>
            </div>
          )}

          {/* Event Values */}
          {element["event values"] && element["event values"].length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-2">
                <BadgeCheck size={14} className="text-blue-500" />
                Event Values
              </span>
              <div className="flex flex-wrap gap-2">
                {element["event values"].map((val, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-mono border border-blue-100 dark:border-blue-900/40">
                    {val}
                  </span>
                ))}
              </div>
            </div>
          )}


          {/* Usage/Values for Types */}
          {element.usage && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Values</span>
              <div className="text-[var(--foreground)] text-xs bg-[var(--background)] p-2 rounded border border-[var(--border-color)] italic">
                {element.usage}
              </div>
            </div>
          )}

          {/* Examples */}
          {element.examples && element.examples.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-2">
                <ListTodo size={14} className="text-green-500" />
                Examples
              </span>
              <SkriptHighlighter code={element.examples.join('\n')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
