import {SkElement} from "@/lib/types";
import {BadgeCheck, Clock, FileText, List, ListTodo, Terminal} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ElementCardProps {
    element: SkElement;
    category: string;
}

// Simple Skript Syntax Highlighter based on the provided screenshot (VS Code Dark+ style)
function SkriptHighlighter({code}: { code: string }) {
    // Define token patterns
    const tokens = [
        {type: 'comment', regex: /#.*$/gm, color: '#6A9955'},
        {type: 'string', regex: /"([^"\\]|\\.)*"/g, color: '#CE9178'},
        {
            type: 'keyword',
            regex: /\b(register|with id|set|to|loop|between|and|at|vector|within|from|add|remove|delete|is|has|contains)\b/g,
            color: '#569CD6'
        },
        {type: 'boolean', regex: /\b(true|false|yes|no|on|off)\b/g, color: '#569CD6'},
        {type: 'number', regex: /\b\d+(\.\d+)?\b/g, color: '#B5CEA8'},
        {type: 'variable', regex: /\{[^}]+\}/g, color: '#9CDCFE'},
        {type: 'section', regex: /^[ \t]*[^#\n]+:$/gm, color: '#D4D4D4', bold: true},
    ];

    const lines = code.split('\n');

    return (
        <div
            className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-gray-800 flex font-mono text-sm shadow-xl">
            {/* Gutter / Line Numbers */}
            <div
                className="bg-[#1E1E1E] px-4 py-4 text-right select-none border-r border-gray-800/50 text-gray-600 min-w-[3.5rem]">
                {lines.map((_, i) => (
                    <div key={i} className="leading-6 h-6">{i + 1}</div>
                ))}
            </div>

            {/* Code Area */}
            <div className="flex-1 overflow-x-auto p-4 py-4">
        <pre className="text-[#D4D4D4] leading-6">
          <code>
            {lines.map((line, lineIdx) => {
                let parts: { text: string; color?: string; bold?: boolean }[] = [{text: line}];

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
                                newParts.push({text: part.text.substring(lastIndex, match.index)});
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
                            newParts.push({text: part.text.substring(lastIndex)});
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

export default function ElementCard({element, category}: ElementCardProps) {
    return (
        <div
            className="bg-[var(--card-bg)] rounded-[32px] shadow-sm border border-[var(--border-color)] overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group hover:-translate-y-1">
            <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <h3 className="text-2xl font-black text-[var(--foreground)] group-hover:text-orange-600 transition-colors tracking-tight leading-none">
                        {element.name}
                    </h3>
                    {element.since && element.since.length > 0 && (
                        <div
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl text-xs font-black border border-orange-500/20 shrink-0 uppercase tracking-widest shadow-sm">
                            <Clock size={12} strokeWidth={3}/>
                            {element.since[0]}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Pattern */}
                    {element.patterns && element.patterns.length > 0 && (
                        <div>
              <span
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2 mb-3 opacity-50">
                <div className="w-5 h-5 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Terminal size={12} className="text-orange-500"/>
                </div>
                Pattern
              </span>
                            <div
                                className="bg-[#0f172a] p-6 rounded-[24px] border-2 border-slate-800/50 font-mono text-sm shadow-2xl relative overflow-hidden group/pattern">
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"/>
                                {element.patterns.map((pattern, idx) => {
                                    let displayPattern = pattern;
                                    const hasEntries = (category === 'structures' || category === 'expressions' || category === 'sections') && element.entries && element.entries.length > 0;

                                    if (hasEntries && !displayPattern.endsWith(':')) {
                                        displayPattern += ':';
                                    }

                                    return (
                                        <div key={idx} className="mb-4 last:mb-0 relative z-10">
                                            <div
                                                className="text-orange-400 font-bold leading-relaxed">{displayPattern}</div>
                                            {hasEntries && element.entries?.map((entry, eIdx) => (
                                                <div key={eIdx}
                                                     className="pl-8 mt-2 flex items-baseline gap-3 border-l-2 border-slate-800/50 ml-1">
                                                    <span className="text-slate-300 font-medium">{entry.name}:</span>
                                                    <span
                                                        className="text-green-400/80 italic text-[11px] font-medium tracking-tight"># {entry.isRequired ? 'Required' : 'Optional'} {entry.isSection ? 'code' : 'value'}</span>
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
               <span
                   className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2 mb-3 opacity-50">
                 <div className="w-5 h-5 bg-blue-500/10 rounded-lg flex items-center justify-center">
                   <FileText size={12} className="text-blue-500"/>
                 </div>
                 Description
               </span>
                            <div
                                className="text-[var(--foreground)] text-base leading-relaxed prose prose-sm max-w-none font-medium">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                                        ul: ({node, ...props}) => <ul
                                            className="list-disc ml-6 mb-4 space-y-1" {...props} />,
                                        ol: ({node, ...props}) => <ol
                                            className="list-decimal ml-6 mb-4 space-y-1" {...props} />,
                                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                        code: ({node, ...props}) => <code
                                            className="bg-orange-500/5 dark:bg-orange-500/10 px-2 py-0.5 rounded-md text-orange-600 dark:text-orange-400 font-black font-mono text-xs border border-orange-500/10" {...props} />,
                                        strong: ({node, ...props}) => <strong
                                            className="font-black text-[var(--foreground)]" {...props} />,
                                        a: ({node, ...props}) => <a
                                            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-black underline decoration-orange-500/30 underline-offset-4 transition-all" {...props} />,
                                    }}
                                >
                                    {element.description.join('\n\n')}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Event Values */}
                    {element["event values"] && element["event values"].length > 0 && (
                        <div className="pt-2">
              <span
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2 mb-3 opacity-50">
                <div className="w-5 h-5 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <BadgeCheck size={12} className="text-blue-500"/>
                </div>
                Event Values
              </span>
                            <div className="flex flex-wrap gap-2">
                                {element["event values"].map((val, i) => (
                                    <span key={i}
                                          className="px-3 py-1.5 bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                    {val}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Usage/Values for Types */}
                    {element.usage && (
                        <div className="pt-2">
              <span
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2 mb-3 opacity-50">
                <div className="w-5 h-5 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <List size={12} className="text-orange-500"/>
                </div>
                Values
              </span>
                            <div
                                className="bg-orange-500/[0.03] dark:bg-orange-500/[0.05] p-5 rounded-[24px] border border-orange-500/10 shadow-inner group/values relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/20"/>
                                <p className="text-[var(--foreground)] text-sm font-bold leading-relaxed tracking-tight">
                                    {element.usage.split(',').map((val, i, arr) => (
                                        <span key={i} className="inline-block">
                      <span className="text-orange-600 dark:text-orange-400">{val.trim()}</span>
                                            {i < arr.length - 1 &&
                                                <span className="text-[var(--text-muted)] opacity-40 mr-2">,</span>}
                    </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Examples */}
                    {element.examples && element.examples.length > 0 && (
                        <div className="pt-2">
              <span
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2 mb-3 opacity-50">
                <div className="w-5 h-5 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <ListTodo size={12} className="text-green-500"/>
                </div>
                Examples
              </span>
                            <SkriptHighlighter code={element.examples.join('\n')}/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
