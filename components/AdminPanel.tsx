"use client";

import { useState } from "react";
import { saveDocs } from "@/lib/store";
import { SkDocs } from "@/lib/types";
import { Upload, LogIn, X, CheckCircle2, AlertCircle, Search, Edit2, Save, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPanel({ onClose, onUploadSuccess }: { onClose: () => void, onUploadSuccess: () => void }) {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={cn(
        "bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full overflow-hidden relative transition-all duration-300",
        isLoggedIn ? "max-w-4xl h-[80vh]" : "max-w-md"
      )}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="h-full flex flex-col">
          {!isLoggedIn ? (
            <div className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <LogIn className="text-orange-600 dark:text-orange-400" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">Admin Login</h2>
                  <p className="text-[var(--text-muted)] text-sm">Sign in to manage documentation</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] opacity-70 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] opacity-70 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/40">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Login
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Header with Tabs */}
              <div className="px-8 pt-6 border-b border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={() => setView("upload")}
                      className={cn(
                        "pb-4 px-4 text-sm font-bold transition-all border-b-2 cursor-pointer",
                        view === "upload" ? "text-orange-600 border-orange-600" : "text-[var(--text-muted)] border-transparent hover:text-orange-600 hover:bg-orange-50/30 rounded-t-lg transition-all"
                      )}
                    >
                      Upload JSON
                    </button>
                    <button 
                      onClick={() => setView("manage")}
                      className={cn(
                        "pb-4 px-4 text-sm font-bold transition-all border-b-2 cursor-pointer",
                        view === "manage" ? "text-orange-600 border-orange-600" : "text-[var(--text-muted)] border-transparent hover:text-orange-600 hover:bg-orange-50/30 rounded-t-lg transition-all"
                      )}
                    >
                      Manage Elements
                    </button>
                  </div>
                  {docs && <p className="text-xs text-[var(--text-muted)] pb-4 pr-6">Current version: v{docs.metadata.version}</p>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {editingElement ? (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={() => setEditingElement(null)}
                        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--foreground)] font-medium transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={18} />
                        Back to List
                      </button>
                      <h2 className="text-xl font-bold text-[var(--foreground)]">Edit Element</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Name</label>
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Since (Comma separated)</label>
                        <input 
                          type="text" 
                          value={editSince}
                          onChange={(e) => setEditSince(e.target.value)}
                          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                          placeholder="1.0.0, 2.0.0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Patterns (One per line)</label>
                        <textarea 
                          value={editPatterns}
                          onChange={(e) => setEditPatterns(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Description (One per line for paragraphs)</label>
                        <textarea 
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Examples (One per line)</label>
                        <textarea 
                          value={editExamples}
                          onChange={(e) => setEditExamples(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-mono text-sm"
                        />
                      </div>

                      <div className="pt-4">
                        <button 
                          onClick={handleSaveEdit}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Save size={18} />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : view === "upload" ? (
                  <div className="space-y-6 text-center max-w-md mx-auto py-10">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="text-green-600 dark:text-green-400" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[var(--foreground)]">Upload Documentation</h2>
                      <p className="text-[var(--text-muted)] text-sm">Select your json-docs.json file</p>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className={cn(
                        "border-2 border-dashed rounded-2xl p-8 transition-all",
                        success ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-[var(--border-color)] hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                      )}>
                        {success ? (
                          <div className="text-green-600 dark:text-green-400 space-y-2">
                            <CheckCircle2 size={40} className="mx-auto" />
                            <p className="font-bold">Successfully Updated!</p>
                          </div>
                        ) : (
                          <div className="text-[var(--text-muted)] space-y-2">
                            <Upload size={40} className="mx-auto text-[var(--text-muted)] opacity-50" />
                            <p className="font-medium">Click or drag and drop</p>
                            <p className="text-xs">JSON files only</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/40 text-left">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search elements..."
                          value={manageSearch}
                          onChange={(e) => setManageSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border-color)] text-[var(--foreground)] rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                      <select 
                        value={activeManageCategory}
                        onChange={(e) => setActiveManageCategory(e.target.value as keyof SkDocs)}
                        className="px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-sm font-semibold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 capitalize"
                      >
                        {["types", "structures", "events", "sections", "effects", "expressions", "conditions", "functions"].map(cat => (
                          <option key={cat} value={cat} className="bg-[var(--background)]">{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-900/50 text-[var(--text-muted)] font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-6 py-3">Element Name</th>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                          {filteredManageElements.length > 0 ? (
                            filteredManageElements.map((el) => (
                              <tr key={el.id} className="hover:bg-orange-50/20 dark:hover:bg-slate-700/50 transition-colors group">
                                <td className="px-6 py-4 font-bold text-[var(--foreground)]">{el.name}</td>
                                <td className="px-6 py-4 font-mono text-xs text-[var(--text-muted)]">{el.id}</td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => startEditing(el)}
                                    className="p-2 text-[var(--text-muted)] hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-100/50 dark:hover:bg-orange-900/20 rounded-lg transition-all cursor-pointer"
                                    title="Edit Element"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to remove "${el.name}"?`)) {
                                        handleDeleteElement(activeManageCategory, el.id);
                                      }
                                    }}
                                    className="p-2 text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer"
                                    title="Remove Element"
                                  >
                                    <X size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-10 text-center text-[var(--text-muted)]">
                                No elements found in this category.
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
