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
        "bg-white rounded-2xl shadow-2xl w-full overflow-hidden relative transition-all duration-300",
        isLoggedIn ? "max-w-4xl h-[80vh]" : "max-w-md"
      )}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="h-full flex flex-col">
          {!isLoggedIn ? (
            <div className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <LogIn className="text-orange-600" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
                  <p className="text-gray-500 text-sm">Sign in to manage documentation</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
                  >
                    Login
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {/* Header with Tabs */}
              <div className="px-8 pt-8 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <button 
                    onClick={() => setView("upload")}
                    className={cn(
                      "pb-4 text-sm font-bold transition-all border-b-2",
                      view === "upload" ? "text-orange-600 border-orange-600" : "text-gray-400 border-transparent hover:text-gray-600"
                    )}
                  >
                    Upload JSON
                  </button>
                  <button 
                    onClick={() => setView("manage")}
                    className={cn(
                      "pb-4 text-sm font-bold transition-all border-b-2",
                      view === "manage" ? "text-orange-600 border-orange-600" : "text-gray-400 border-transparent hover:text-gray-600"
                    )}
                  >
                    Manage Elements
                  </button>
                </div>
                {docs && <p className="text-xs text-gray-400">Current version: v{docs.metadata.version}</p>}
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {editingElement ? (
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={() => setEditingElement(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
                      >
                        <ArrowLeft size={18} />
                        Back to List
                      </button>
                      <h2 className="text-xl font-bold text-gray-900">Edit Element</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Name</label>
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Since (Comma separated)</label>
                        <input 
                          type="text" 
                          value={editSince}
                          onChange={(e) => setEditSince(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                          placeholder="1.0.0, 2.0.0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Patterns (One per line)</label>
                        <textarea 
                          value={editPatterns}
                          onChange={(e) => setEditPatterns(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description (One per line for paragraphs)</label>
                        <textarea 
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Examples (One per line)</label>
                        <textarea 
                          value={editExamples}
                          onChange={(e) => setEditExamples(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-mono text-sm"
                        />
                      </div>

                      <div className="pt-4">
                        <button 
                          onClick={handleSaveEdit}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                        >
                          <Save size={18} />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : view === "upload" ? (
                  <div className="space-y-6 text-center max-w-md mx-auto py-10">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="text-green-600" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Upload Documentation</h2>
                      <p className="text-gray-500 text-sm">Select your json-docs.json file</p>
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
                        success ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-orange-400 hover:bg-orange-50"
                      )}>
                        {success ? (
                          <div className="text-green-600 space-y-2">
                            <CheckCircle2 size={40} className="mx-auto" />
                            <p className="font-bold">Successfully Updated!</p>
                          </div>
                        ) : (
                          <div className="text-gray-500 space-y-2">
                            <Upload size={40} className="mx-auto text-gray-400" />
                            <p className="font-medium">Click or drag and drop</p>
                            <p className="text-xs">JSON files only</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-left">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search elements..."
                          value={manageSearch}
                          onChange={(e) => setManageSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                      <select 
                        value={activeManageCategory}
                        onChange={(e) => setActiveManageCategory(e.target.value as keyof SkDocs)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 capitalize"
                      >
                        {["types", "structures", "events", "sections", "effects", "expressions", "conditions", "functions"].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-6 py-3">Element Name</th>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredManageElements.length > 0 ? (
                            filteredManageElements.map((el) => (
                              <tr key={el.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 font-bold text-gray-900">{el.name}</td>
                                <td className="px-6 py-4 font-mono text-xs text-gray-400">{el.id}</td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => startEditing(el)}
                                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
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
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Remove Element"
                                  >
                                    <X size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
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
