"use client";

import {useState} from "react";
import {saveDocs} from "@/lib/store";
import {SkDocs} from "@/lib/types";
import {AlertCircle, ArrowLeft, CheckCircle2, Edit2, LogIn, Save, Search, Upload, X} from "lucide-react";
import {cn} from "@/lib/utils";
import {motion} from "framer-motion";

export default function AdminPanel({onClose, onUploadSuccess}: { onClose: () => void, onUploadSuccess: () => void }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [view, setView] = useState<"upload" | "manage">("upload");
    const [docs, setDocs] = useState<SkDocs | null>(null);
    const [activeManageCategory, setActiveManageCategory] = useState<keyof SkDocs>("effects");
    const [manageSearch, setManageSearch] = useState("");
    const [editingElement, setEditingElement] = useState<any | null>(null);

    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editSince, setEditSince] = useState("");
    const [editExamples, setEditExamples] = useState("");
    const [editPatterns, setEditPatterns] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple mock login as requested
        if (username === "admin" && password === "skbee") {
            setIsLoggedIn(true);
            setError("");
            setDocs(saveDocs.name ? (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("skbee-docs-data") || 'null') : null) : null);
            // Actually let's use the helper
            const currentDocs = (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("skbee-docs-data") || 'null') : null);
            setDocs(currentDocs);
        } else {
            setError("Invalid credentials. Try admin/skbee");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                // Check if it's empty
                if (!text || text.trim() === "") throw new Error("File is empty");

                const json = JSON.parse(text) as SkDocs;
                if (!json.metadata) throw new Error("Invalid format: missing metadata");

                saveDocs(json);
                setDocs(json);
                setSuccess(true);
                setError(""); // Clear any previous errors
                setTimeout(() => {
                    onUploadSuccess();
                    setSuccess(false);
                    setView("manage");
                }, 1500);
            } catch (err: any) {
                setError(err.message || "Failed to parse JSON. Please ensure it follows the SkBee documentation structure.");
                setSuccess(false);
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteElement = (categoryId: string, elementId: string) => {
        if (!docs) return;

        const category = categoryId as keyof SkDocs;
        if (Array.isArray(docs[category])) {
            const updatedElements = (docs[category] as any[]).filter(el => el.id !== elementId);
            const updatedDocs = {
                ...docs,
                [category]: updatedElements
            };
            saveDocs(updatedDocs);
            setDocs(updatedDocs);
            onUploadSuccess();
        }
    };

    const startEditing = (el: any) => {
        setEditingElement(el);
        setEditName(el.name || "");
        setEditDescription(el.description?.join("\n") || "");
        setEditSince(el.since?.join(", ") || "");
        setEditPatterns(el.patterns?.join("\n") || "");
        setEditExamples(el.examples?.join("\n") || "");
    };

    const handleSaveEdit = () => {
        if (!docs || !editingElement) return;

        const category = activeManageCategory as keyof SkDocs;
        if (Array.isArray(docs[category])) {
            const updatedElements = (docs[category] as any[]).map(el => {
                if (el.id === editingElement.id) {
                    return {
                        ...el,
                        name: editName,
                        description: editDescription.split("\n").filter(line => line.length > 0),
                        since: editSince.split(",").map(s => s.trim()).filter(s => s.length > 0),
                        patterns: editPatterns.split("\n").filter(line => line.length > 0),
                        examples: editExamples.split("\n").filter(line => line.length > 0)
                    };
                }
                return el;
            });

            const updatedDocs = {
                ...docs,
                [category]: updatedElements
            };
            saveDocs(updatedDocs);
            setDocs(updatedDocs);
            onUploadSuccess();
            setEditingElement(null);
        }
    };

    const filteredManageElements = docs ? (docs[activeManageCategory] as any[] || [])
            .filter(el =>
                el.name?.toLowerCase().includes(manageSearch.toLowerCase()) ||
                el.id?.toLowerCase().includes(manageSearch.toLowerCase())
            )
            .sort((a, b) => (a.id || "").localeCompare(b.id || ""))
        : [];

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className={cn(
                "bg-[var(--card-bg)] rounded-[32px] shadow-2xl w-full overflow-hidden relative transition-all duration-500 border border-[var(--border-color)]",
                isLoggedIn ? "max-w-5xl h-[85vh]" : "max-w-md"
            )}>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 p-2 hover:bg-orange-500/10 rounded-xl transition-all z-10 cursor-pointer"
                >
                    <X size={24}/>
                </button>

                <div className="h-full flex flex-col">
                    {!isLoggedIn ? (
                        <div className="p-10">
                            <div className="space-y-8">
                                <div className="text-center">
                                    <div
                                        className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20 ring-4 ring-orange-500/10">
                                        <LogIn className="text-white" size={36}/>
                                    </div>
                                    <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Admin
                                        Portal</h2>
                                    <p className="text-[var(--text-muted)] font-bold text-sm mt-2 opacity-60 uppercase tracking-widest">Manage
                                        your documentation</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1 opacity-50">Username</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-5 py-3.5 rounded-[18px] border-2 border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold placeholder:opacity-30"
                                            placeholder="admin"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1 opacity-50">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-5 py-3.5 rounded-[18px] border-2 border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold placeholder:opacity-30"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {error && (
                                        <div
                                            className="flex items-center gap-3 text-red-600 dark:text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20 font-bold animate-in shake-in duration-300">
                                            <AlertCircle size={18}/>
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-[20px] shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] cursor-pointer mt-2 text-lg tracking-tight"
                                    >
                                        Authenticate
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header with Tabs */}
                            <div className="px-10 pt-8 border-b border-[var(--border-color)] bg-[var(--sidebar-bg)]">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Admin
                                        Control</h2>
                                    {docs && (
                                        <div
                                            className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-500/20 mr-8">
                                            v{docs.metadata.version}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-8 mt-4">
                                    <button
                                        onClick={() => setView("upload")}
                                        className={cn(
                                            "pb-4 px-2 text-sm font-black transition-all border-b-4 cursor-pointer tracking-tight",
                                            view === "upload" ? "text-orange-600 border-orange-500" : "text-[var(--text-muted)] border-transparent hover:text-orange-600 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        Upload Documentation
                                    </button>
                                    <button
                                        onClick={() => setView("manage")}
                                        className={cn(
                                            "pb-4 px-2 text-sm font-black transition-all border-b-4 cursor-pointer tracking-tight",
                                            view === "manage" ? "text-orange-600 border-orange-500" : "text-[var(--text-muted)] border-transparent hover:text-orange-600 opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        Manage Database
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                {editingElement ? (
                                    <div className="space-y-8 max-w-3xl mx-auto">
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={() => setEditingElement(null)}
                                                className="flex items-center gap-2 text-orange-600 font-black text-sm hover:translate-x-1 transition-transform cursor-pointer"
                                            >
                                                <ArrowLeft size={18} strokeWidth={3}/>
                                                BACK TO LIST
                                            </button>
                                            <span
                                                className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-50">Editor Mode</span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-8">
                                            <div className="space-y-3">
                                                <label
                                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Display
                                                    Name</label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full px-5 py-3.5 bg-[var(--background)] border-2 border-[var(--border-color)] text-[var(--foreground)] rounded-2xl focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label
                                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Introduction
                                                    Version</label>
                                                <input
                                                    type="text"
                                                    value={editSince}
                                                    onChange={(e) => setEditSince(e.target.value)}
                                                    className="w-full px-5 py-3.5 bg-[var(--background)] border-2 border-[var(--border-color)] text-[var(--foreground)] rounded-2xl focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold"
                                                    placeholder="e.g. 1.0.0"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label
                                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Syntax
                                                    Patterns</label>
                                                <textarea
                                                    value={editPatterns}
                                                    onChange={(e) => setEditPatterns(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-5 py-4 bg-[#0f172a] border-2 border-slate-800 text-orange-400 rounded-2xl focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-mono text-sm font-bold leading-relaxed"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label
                                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Detailed
                                                    Description</label>
                                                <textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    rows={4}
                                                    className="w-full px-5 py-4 bg-[var(--background)] border-2 border-[var(--border-color)] text-[var(--foreground)] rounded-2xl focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-sm leading-relaxed"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label
                                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1">Code
                                                    Snippets</label>
                                                <textarea
                                                    value={editExamples}
                                                    onChange={(e) => setEditExamples(e.target.value)}
                                                    rows={6}
                                                    className="w-full px-5 py-4 bg-[#0f172a] border-2 border-slate-800 text-[#D4D4D4] rounded-2xl focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-mono text-sm leading-relaxed"
                                                />
                                            </div>

                                            <div className="pt-4 pb-10">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-[24px] shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer text-lg tracking-tight active:scale-95"
                                                >
                                                    <Save size={20} strokeWidth={3}/>
                                                    Commit Changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : view === "upload" ? (
                                    <div className="space-y-6 text-center max-w-lg mx-auto py-6">
                                        <div
                                            className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-[28px] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/20 ring-4 ring-green-500/10">
                                            <Upload className="text-white" size={32}/>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Sync
                                                Documentation</h2>
                                            <p className="text-[var(--text-muted)] font-bold text-xs mt-1 opacity-60 uppercase tracking-widest">Select
                                                your master JSON file</p>
                                        </div>

                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={cn(
                                                "border-4 border-dashed rounded-[28px] p-8 transition-all duration-300 relative overflow-hidden",
                                                success
                                                    ? "border-green-500 bg-green-500/5 shadow-2xl shadow-green-500/10"
                                                    : "border-[var(--border-color)] group-hover:border-orange-500 group-hover:bg-orange-500/5 group-hover:shadow-2xl group-hover:shadow-orange-500/5"
                                            )}>
                                                {success ? (
                                                    <motion.div
                                                        initial={{scale: 0.8, opacity: 0}}
                                                        animate={{scale: 1, opacity: 1}}
                                                        className="text-green-600 dark:text-green-400 space-y-3"
                                                    >
                                                        <CheckCircle2 size={40} className="mx-auto" strokeWidth={3}/>
                                                        <p className="font-black text-lg tracking-tight">Database
                                                            Synchronized!</p>
                                                    </motion.div>
                                                ) : (
                                                    <div className="text-[var(--text-muted)] space-y-3">
                                                        <Upload size={40}
                                                                className="mx-auto opacity-20 group-hover:opacity-100 group-hover:text-orange-500 transition-all duration-300"
                                                                strokeWidth={1.5}/>
                                                        <div>
                                                            <p className="font-black text-lg tracking-tight text-[var(--foreground)]">Drop
                                                                your JSON here</p>
                                                            <p className="text-[10px] font-bold opacity-50 mt-1 uppercase tracking-widest">or
                                                                click to browse filesystem</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {error && (
                                            <div
                                                className="flex items-center gap-3 text-red-600 dark:text-red-400 text-sm bg-red-500/10 p-5 rounded-2xl border border-red-500/20 text-left font-bold animate-in slide-in-from-bottom-2">
                                                <AlertCircle size={20}/>
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 relative group">
                                                <Search
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-orange-500 transition-colors"
                                                    size={20}/>
                                                <input
                                                    type="text"
                                                    placeholder="Search database..."
                                                    value={manageSearch}
                                                    onChange={(e) => setManageSearch(e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-[var(--background)] border-2 border-[var(--border-color)] text-[var(--foreground)] rounded-2xl text-sm font-bold focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:opacity-30"
                                                />
                                            </div>
                                            <select
                                                value={activeManageCategory}
                                                onChange={(e) => setActiveManageCategory(e.target.value as keyof SkDocs)}
                                                className="px-6 py-4 bg-[var(--background)] border-2 border-[var(--border-color)] rounded-2xl text-sm font-black text-[var(--foreground)] outline-none focus:ring-8 focus:ring-orange-500/10 focus:border-orange-500 capitalize cursor-pointer transition-all"
                                            >
                                                {["types", "structures", "events", "sections", "effects", "expressions", "conditions", "functions"].map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div
                                            className="bg-[var(--background)] rounded-[24px] overflow-hidden border-2 border-[var(--border-color)] shadow-sm">
                                            <table className="w-full text-left text-sm border-collapse">
                                                <thead
                                                    className="bg-slate-500/5 text-[var(--text-muted)] font-black uppercase tracking-[0.2em] text-[10px] border-b-2 border-[var(--border-color)]">
                                                <tr>
                                                    <th className="px-8 py-5">Entry Name</th>
                                                    <th className="px-8 py-5">Unique Identifier</th>
                                                    <th className="px-8 py-5 text-right">Operations</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y-2 divide-[var(--border-color)]">
                                                {filteredManageElements.length > 0 ? (
                                                    filteredManageElements.map((el) => (
                                                        <tr key={el.id}
                                                            className="hover:bg-orange-500/5 transition-all group">
                                                            <td className="px-8 py-5 font-black text-[var(--foreground)] text-base tracking-tight">{el.name}</td>
                                                            <td className="px-8 py-5 font-mono text-xs text-[var(--text-muted)] font-bold opacity-60 group-hover:opacity-100 transition-opacity">{el.id}</td>
                                                            <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                                                                <button
                                                                    onClick={() => startEditing(el)}
                                                                    className="p-3 text-[var(--text-muted)] hover:text-white hover:bg-orange-500 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-orange-500/30"
                                                                    title="Edit Element"
                                                                >
                                                                    <Edit2 size={18} strokeWidth={2.5}/>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm(`Irreversible Action: Are you sure you want to delete "${el.name}"?`)) {
                                                                            handleDeleteElement(activeManageCategory, el.id);
                                                                        }
                                                                    }}
                                                                    className="p-3 text-[var(--text-muted)] hover:text-white hover:bg-red-500 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-red-500/30"
                                                                    title="Remove Element"
                                                                >
                                                                    <X size={18} strokeWidth={2.5}/>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-8 py-20 text-center">
                                                            <p className="text-[var(--text-muted)] font-black text-lg opacity-40">DATABASE
                                                                EMPTY IN THIS CATEGORY</p>
                                                        </td>
                                                    </tr>
                                                )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
