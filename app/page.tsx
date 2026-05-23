"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { CATEGORIES, getDocs } from "@/lib/store";
import { SkCategory, SkDocs, SkElement } from "@/lib/types";
import { Search, Menu, X, Settings, BookOpen, ChevronRight, Sun, Moon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import ElementCard from "@/components/ElementCard";
import AdminPanel from "@/components/AdminPanel";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [docs, setDocs] = useState<SkDocs | null>(null);
  const [activeCategory, setActiveCategory] = useState<SkCategory>("types");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen flex flex-col md:flex-row transition-all duration-300">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] shadow-xl md:shadow-none transform transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-18" : "w-64"
      )}>
        <div className={cn("h-full flex flex-col transition-all duration-300", isCollapsed ? "p-3" : "p-5")}>
          <div className={cn("flex items-center gap-3 mb-8 overflow-hidden whitespace-nowrap", isCollapsed ? "justify-center mt-2" : "")}>
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 dark:shadow-none ring-4 ring-orange-500/10">
              <BookOpen className="text-white" size={22} />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <h1 className="text-lg font-black text-[var(--foreground)] tracking-tight">SkBee Docs</h1>
                <div className="flex items-center gap-2">
                  {docs && <p className="text-[10px] font-black text-orange-500 uppercase tracking-tighter bg-orange-500/10 px-1.5 rounded">v{docs.metadata.version}</p>}
                  <span className="text-[8px] text-[var(--text-muted)] font-medium opacity-60">Build: 2026-05-22-22-06</span>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-hide">
            {!isCollapsed && (
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 px-4 opacity-50">Categories</p>
            )}
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setIsSidebarOpen(false);
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={cn(
                  "w-full flex items-center px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 group cursor-pointer relative overflow-hidden",
                  isCollapsed ? "justify-center px-0" : "justify-between",
                  activeCategory === cat
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-400/50"
                    : "text-[var(--text-muted)] hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400"
                )}
                title={isCollapsed ? cat.charAt(0).toUpperCase() + cat.slice(1) : ""}
              >
                <div className="flex items-center gap-3 overflow-hidden z-10">
                  {isCollapsed ? (
                    <span className="capitalize text-sm font-black">{cat.charAt(0)}</span>
                  ) : (
                    <span className="capitalize truncate">{cat}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <ChevronRight size={15} className={cn(
                    "flex-shrink-0 transition-all duration-300 z-10",
                    activeCategory === cat ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  )} />
                )}
                {activeCategory === cat && (
                  <motion.div 
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-1">
              <button
                onClick={toggleTheme}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold text-[var(--text-muted)] hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer",
                  isCollapsed ? "justify-center px-0" : ""
                )}
                title={isCollapsed ? (theme === "light" ? "Light Mode" : "Dark Mode") : ""}
              >
              <div className="w-7 h-7 rounded-lg bg-orange-500/5 flex items-center justify-center">
                {theme === "light" ? <Sun size={15} /> : <Moon size={15} />}
              </div>
              {!isCollapsed && (theme === "light" ? "Light Mode" : "Dark Mode")}
            </button>
            <button
              onClick={() => setIsAdminOpen(true)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold text-[var(--text-muted)] hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer",
                isCollapsed ? "justify-center px-0" : ""
              )}
              title={isCollapsed ? "Admin Settings" : ""}
            >
              <div className="w-7 h-7 rounded-lg bg-orange-500/5 flex items-center justify-center">
                <Settings size={15} />
              </div>
              {!isCollapsed && "Admin Settings"}
            </button>
            
            {/* Collapse Toggle - Only visible on desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "hidden md:flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold text-[var(--text-muted)] hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400 transition-all cursor-pointer mt-1",
                isCollapsed ? "justify-center px-0" : ""
              )}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <div className="w-7 h-7 rounded-lg bg-orange-500/5 flex items-center justify-center">
                {isCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              </div>
              {!isCollapsed && "Collapse Sidebar"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[var(--background)]">
        {/* Header */}
        <header className="bg-[var(--header-bg)] glass border-b border-[var(--border-color)] px-4 md:px-8 py-5 sticky top-0 z-30 transition-all duration-300">
          <div className="max-w-5xl mx-auto flex items-center gap-6">
            <button
              className="md:hidden text-[var(--text-muted)] hover:text-orange-600 p-2 hover:bg-orange-500/10 rounded-xl transition-all cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-orange-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder={`Search ${activeCategory}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-[var(--card-bg)] border-2 border-[var(--border-color)] text-[var(--foreground)] focus:border-orange-500 dark:focus:border-orange-500 focus:ring-8 focus:ring-orange-500/10 rounded-[20px] outline-none transition-all text-sm font-bold shadow-sm placeholder:opacity-50"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            {!docs ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-[40px] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full" />
                  <BookOpen className="text-orange-500 relative z-10" size={64} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight">No Documentation Found</h2>
                  <p className="text-[var(--text-muted)] max-w-sm mx-auto mt-3 font-medium leading-relaxed">
                    Ready to set up your docs? Login to the Admin Panel and upload your <code className="text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-lg font-bold">json-docs.json</code> file.
                  </p>
                </div>
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-orange-500/20 hover:bg-orange-600 hover:shadow-orange-500/30 hover:-translate-y-1 transition-all cursor-pointer active:scale-95"
                >
                  Open Admin Settings
                </button>
              </motion.div>
            ) : (
              <div className="space-y-10">
                <div className="flex items-end justify-between px-2">
                  <div>
                    <motion.h2 
                      key={activeCategory}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-4xl font-black text-[var(--foreground)] capitalize tracking-tighter"
                    >
                      {activeCategory}
                    </motion.h2>
                    <p className="text-[var(--text-muted)] mt-1 font-bold text-sm opacity-60 uppercase tracking-widest">{filteredElements.length} elements available</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeCategory + searchQuery}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="grid grid-cols-1 gap-8"
                  >
                    {filteredElements.length > 0 ? (
                      filteredElements.map((el) => (
                        <ElementCard key={el.id} element={el} category={activeCategory} />
                      ))
                    ) : (
                      <div className="bg-[var(--card-bg)] rounded-[32px] p-20 text-center border-2 border-dashed border-[var(--border-color)]">
                        <div className="w-20 h-20 bg-orange-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
                           <Search className="text-orange-500/30" size={40} />
                        </div>
                        <p className="text-[var(--text-muted)] font-black text-xl tracking-tight">Zero matches found</p>
                        <p className="text-[var(--text-muted)] opacity-60 mt-2 font-medium">Try adjusting your search terms or category.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
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
