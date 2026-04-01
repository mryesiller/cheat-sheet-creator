import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { FileText, Share2, Printer, ToggleLeft, Palette, GripVertical } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Create Beautiful Cheat Sheets
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Build, customize, and share printable cheat sheets about anything.
            Keyboard shortcuts, programming languages, cooking recipes — you
            name it.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started — It&apos;s Free
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Example Preview */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden bg-white dark:bg-gray-800 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: "Keyboard Shortcuts", color: "#3b82f6", items: ["Ctrl+C → Copy", "Ctrl+V → Paste", "Ctrl+Z → Undo"] },
                { title: "Git Commands", color: "#8b5cf6", items: ["git add . → Stage all", "git commit → Commit", "git push → Push"] },
                { title: "CSS Properties", color: "#22c55e", items: ["display → Layout", "position → Positioning", "flex → Flexbox"] },
                { title: "VS Code", color: "#f59e0b", items: ["Ctrl+P → Quick Open", "Ctrl+Shift+P → Commands", "Ctrl+` → Terminal"] },
              ].map((section) => (
                <div key={section.title} className="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: section.color }}>
                    {section.title}
                  </div>
                  <div className="px-2 py-1.5 bg-gray-50 dark:bg-gray-700">
                    {section.items.map((item) => (
                      <div key={item} className="text-[10px] text-gray-600 dark:text-gray-300 py-0.5">{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">
              Everything you need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: GripVertical, title: "Drag & Drop Editor", desc: "Visually build your cheat sheet with an intuitive drag-and-drop editor." },
                { icon: Palette, title: "Color-Coded Sections", desc: "8 beautiful color presets to organize your content by category." },
                { icon: Share2, title: "Share via Link", desc: "Every cheat sheet gets a unique URL you can share with anyone." },
                { icon: Printer, title: "Print Optimized", desc: "A4 landscape layout with perfect print styles. Just hit Ctrl+P." },
                { icon: ToggleLeft, title: "Toggle Variants", desc: "Add Mac/Windows toggles or any custom variants for your content." },
                { icon: FileText, title: "Any Topic", desc: "From programming to cooking — create cheat sheets about anything." },
              ].map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3">
                    <feature.icon size={20} />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to create your first cheat sheet?
          </h2>
          <Link
            href="/signup"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
          CheatSheet Creator &middot; Built with Next.js &amp; Supabase
        </footer>
      </main>
    </>
  );
}
