"use client";

import { useState, useEffect, useMemo } from "react";
import { CATEGORIES, getDocs } from "@/lib/store";
import { SkCategory, SkDocs, SkElement } from "@/lib/types";
import { Search, Menu, X, Settings, BookOpen, ChevronRight, Sun, Moon } from "lucide-react";
import ElementCard from "@/components/ElementCard";
import AdminPanel from "@/components/AdminPanel";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export default function Home() {
  const [docs, setDocs] = useState<SkDocs | null>(null);
  const [activeCategory, setActiveCategory] = useState<SkCategory>("effects");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setDocs(getDocs());
  }, []);

  const refreshDocs = () => {
    setDocs(getDocs());
  };

  const filteredElements = useMemo(() => {
    if (!docs) return [];
    const elements = ((docs[activeCategory] as SkElement[]) || [])
      .sort((a, b) => (a.id || "").localeCompare(b.id || ""));
    if (!searchQuery) return elements;

    const query = searchQuery.toLowerCase();
    return elements.filter(
      (el) =>
        el.name?.toLowerCase().includes(query) ||
        el.patterns?.some((p) => p.toLowerCase().includes(query)) ||
        el.description?.some((d) => d.toLowerCase().includes(query))
    );
  }, [docs, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">SkBee Docs</h1>
              <div className="flex items-center gap-2">
                {docs && <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">v{docs.metadata.version}</p>}
                <span className="text-[8px] text-[var(--text-muted)] opacity-50">Build: 2026-05-22-20-38</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 px-3">Categories</p>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                  activeCategory === cat
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 shadow-sm"
                    : "text-[var(--text-muted)] hover:bg-orange-50/30 dark:hover:bg-slate-700/50 hover:text-orange-600 dark:hover:text-[var(--foreground)]"
                )}
              >
                <span className="capitalize">{cat}</span>
                <ChevronRight size={16} className={cn(
                  "transition-transform",
                  activeCategory === cat ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                )} />
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-[var(--border-color)] space-y-1">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:bg-orange-50/30 dark:hover:bg-slate-700/50 hover:text-orange-600 dark:hover:text-[var(--foreground)] transition-all"
            >
              {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "light" ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:bg-orange-50/30 dark:hover:bg-slate-700/50 hover:text-orange-600 dark:hover:text-[var(--foreground)] transition-all"
            >
              <Settings size={18} />
              Admin Settings
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-color)] px-4 md:px-8 py-4 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button
              className="md:hidden text-[var(--text-muted)] hover:text-[var(--foreground)] p-1"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input
                type="text"
                placeholder={`Search ${activeCategory}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--foreground)] focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 rounded-2xl outline-none transition-all text-sm font-medium shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {!docs ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <BookOpen className="text-orange-200 dark:text-orange-900/40" size={48} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Documentation Found</h2>
                  <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mt-2">
                    Please login to the Admin Panel and upload your <code className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1 rounded">json-docs.json</code> file to get started.
                  </p>
                </div>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition-all"
                >
                  Go to Admin Settings
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold text-[var(--foreground)] capitalize tracking-tight">{activeCategory}</h2>
                    <p className="text-[var(--text-muted)] mt-1">Showing {filteredElements.length} elements</p>
                  </div>
                </div>

                {filteredElements.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredElements.map((el) => (
                      <ElementCard key={el.id} element={el} category={activeCategory} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[var(--card-bg)] rounded-2xl p-12 text-center border border-dashed border-[var(--border-color)]">
                    <p className="text-[var(--text-muted)] font-medium">No elements match your search criteria.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Admin Modal */}
      {isAdminOpen && (
        <AdminPanel
          onClose={() => setIsAdminOpen(false)}
          onUploadSuccess={refreshDocs}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
