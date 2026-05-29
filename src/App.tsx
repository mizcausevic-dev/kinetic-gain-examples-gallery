import { useMemo, useState } from 'react';
import {
  Copy,
  ExternalLink,
  FileJson,
  Github,
  Search,
  Sparkles,
} from 'lucide-react';

import { ACCENT_CLASSES, CATEGORY_LABELS, SPECS, type SpecEntry } from './specs';

const SUITE_URL = 'https://suite.kineticgain.com';
const VISUALIZER_URL = 'https://mizcausevic-dev.github.io/kinetic-gain-visualizer/';
const DOCS_URL = 'https://docs.kineticgain.com';
const PORTFOLIO_URL = 'https://portfolio.kineticgain.com';
const PULSE_URL = 'https://pulse.kineticgain.com';

// Trivial JSON syntax highlight by tokenizing the JSON.stringify output.
function highlightJson(value: unknown): string {
  const raw = JSON.stringify(value, null, 2);
  // Escape HTML first
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Then wrap tokens in classed spans
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d*)?([eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-num';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-str';
      } else if (/true|false/.test(match)) {
        cls = 'json-bool';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

export default function App() {
  const [activeKey, setActiveKey] = useState<string>(SPECS[0]!.key);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SPECS;
    return SPECS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.one_liner.toLowerCase().includes(q) ||
        s.version_field.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [query]);

  const active: SpecEntry = SPECS.find((s) => s.key === activeKey) ?? SPECS[0]!;
  const accent = ACCENT_CLASSES[active.accent] ?? ACCENT_CLASSES.blue!;
  const highlighted = highlightJson(active.example);

  function copyExample() {
    navigator.clipboard?.writeText(JSON.stringify(active.example, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Nav />
      <div className="flex-1 grid lg:grid-cols-[280px_1fr] gap-0 max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <aside className="border-r border-slate-200 bg-white lg:min-h-[calc(100vh-3.5rem)] py-6 px-4">
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code mb-2">
              Pick a spec
            </div>
            <div className="flex items-center bg-slate-100 rounded-lg px-3">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="filter…"
                className="flex-1 px-2 py-2 bg-transparent outline-none text-sm placeholder:text-slate-400"
              />
            </div>
          </div>
          <ul className="space-y-1">
            {filtered.map((s) => {
              const isActive = s.key === active.key;
              const a = ACCENT_CLASSES[s.accent] ?? ACCENT_CLASSES.blue!;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => setActiveKey(s.key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border ${
                      isActive
                        ? `${a.bg} ${a.border}`
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2 h-2 rounded-full ${a.dot} flex-shrink-0`} />
                      <span
                        className={`text-sm font-semibold ${
                          isActive ? a.text : 'text-slate-800'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 code pl-4">
                      {CATEGORY_LABELS[s.category]}
                    </div>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="text-xs text-slate-500 italic px-3 py-2">
                no specs match "{query}"
              </li>
            )}
          </ul>
        </aside>

        {/* Main */}
        <main className="p-6 lg:p-10 min-w-0">
          <header className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] uppercase tracking-widest font-bold code px-2 py-0.5 rounded ${accent.bg} ${accent.text} border ${accent.border}`}
              >
                {CATEGORY_LABELS[active.category]}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code">
                detect: <code className="code">{active.version_field}</code>
              </span>
              {active.well_known && (
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code">
                  · path: <code className="code">{active.well_known}</code>
                </span>
              )}
            </div>
            <h1 className={`text-3xl font-bold tracking-tight ${accent.text}`}>{active.title}</h1>
            <p className="text-slate-600 mt-2">{active.one_liner}</p>
          </header>

          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <a
              href={active.landing_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors group"
            >
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code mb-1">
                Landing
              </div>
              <div className="text-sm font-semibold text-slate-900 code">
                {active.landing_url.replace('https://', '')}
              </div>
              <div className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1 group-hover:text-slate-700">
                Open ↗
              </div>
            </a>
            <a
              href={active.repo_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors group"
            >
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code mb-1">
                Spec repo
              </div>
              <div className="text-sm font-semibold text-slate-900 code flex items-center gap-1">
                <Github size={12} className="flex-shrink-0" />
                {active.repo_url.split('/').slice(-1)[0]}
              </div>
              <div className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1 group-hover:text-slate-700">
                Read SPEC.md →
              </div>
            </a>
            <a
              href={`${VISUALIZER_URL}?view=editor`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors group"
            >
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code mb-1">
                Visualizer
              </div>
              <div className="text-sm font-semibold text-slate-900 code">
                paste this example →
              </div>
              <div className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1 group-hover:text-slate-700">
                Open editor view ↗
              </div>
            </a>
          </div>

          <section className="mb-4">
            <div className="text-xs text-slate-600 leading-relaxed mb-3 italic">
              {active.example_caption}
            </div>
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
              <div className="px-4 py-2 bg-slate-950 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 code">
                  <FileJson size={12} />
                  <span>
                    {active.key}.example.json — {Object.keys(active.example as Record<string, unknown>).length} top-level fields
                  </span>
                </div>
                <button
                  onClick={copyExample}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white text-xs"
                >
                  <Copy size={12} />
                  {copied ? 'copied!' : 'copy'}
                </button>
              </div>
              <pre className="p-5 text-[12.5px] leading-relaxed overflow-x-auto code text-slate-100">
                <code dangerouslySetInnerHTML={{ __html: highlighted }} />
              </pre>
            </div>
          </section>

          <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <a
              href={SUITE_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors group"
            >
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code mb-1">
                Protocol suite
              </div>
              <div className="text-sm font-semibold text-slate-900 code">11 open specs</div>
              <div className="text-xs text-slate-500 mt-2 group-hover:text-slate-700">
                Canonical spec landings, governance framing, and buyer-safe disclosure vocabulary.
              </div>
            </a>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors group"
            >
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code mb-1">
                Docs hub
              </div>
              <div className="text-sm font-semibold text-slate-900 code">Implementation routes</div>
              <div className="text-xs text-slate-500 mt-2 group-hover:text-slate-700">
                Quickstart, MCP install paths, validation flow, and suite integration references.
              </div>
            </a>
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors group"
            >
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code mb-1">
                Portfolio map
              </div>
              <div className="text-sm font-semibold text-slate-900 code">60+ live properties</div>
              <div className="text-xs text-slate-500 mt-2 group-hover:text-slate-700">
                Crawlable map of the wider Kinetic Gain network across suite, atlas, and operator surfaces.
              </div>
            </a>
            <a
              href={PULSE_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors group"
            >
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold code mb-1">
                Procurement pulse
              </div>
              <div className="text-sm font-semibold text-slate-900 code">Disclosure research</div>
              <div className="text-xs text-slate-500 mt-2 group-hover:text-slate-700">
                Market-facing research layer measuring adoption of the suite’s machine-readable disclosure pattern.
              </div>
            </a>
          </section>

          <p className="text-xs text-slate-500 mt-6">
            Every example is the canonical reference document from the spec&apos;s <code>examples/</code> folder. The visualizer renders each one with procurement-grade UI, and this gallery keeps all eleven suite documents visible in one crawlable surface so developers, buyers, and answer engines can inspect the raw JSON without leaving the estate.
          </p>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 text-slate-900">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center shadow-sm">
            <Sparkles size={18} />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm">Kinetic Gain Examples</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 code">
              11 specs · canonical examples · answer-engine ready
            </div>
          </div>
        </a>
        <div className="hidden md:flex items-center gap-4">
          <a className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5" href={SUITE_URL} target="_blank" rel="noreferrer">
            <Sparkles size={14} /> suite.kineticgain.com
          </a>
          <a className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5" href={DOCS_URL} target="_blank" rel="noreferrer">
            <ExternalLink size={14} /> docs.kineticgain.com
          </a>
          <a className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5" href="https://github.com/mizcausevic-dev" target="_blank" rel="noreferrer">
            <Github size={14} /> GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 text-xs text-slate-500 flex flex-wrap items-center gap-3">
        <span>
          <strong className="text-slate-700">examples.kineticgain.com</strong> · canonical suite examples · 11 specs · client-side · no API calls
        </span>
        <span className="text-slate-300">·</span>
        <a className="hover:text-slate-900 inline-flex items-center gap-1" href={SUITE_URL} target="_blank" rel="noreferrer">
          suite.kineticgain.com <ExternalLink size={11} />
        </a>
        <a className="hover:text-slate-900 inline-flex items-center gap-1" href={DOCS_URL} target="_blank" rel="noreferrer">
          docs hub <ExternalLink size={11} />
        </a>
        <a className="hover:text-slate-900 inline-flex items-center gap-1" href={PORTFOLIO_URL} target="_blank" rel="noreferrer">
          portfolio map <ExternalLink size={11} />
        </a>
        <a className="hover:text-slate-900 inline-flex items-center gap-1" href={VISUALIZER_URL} target="_blank" rel="noreferrer">
          unified visualizer <ExternalLink size={11} />
        </a>
        <a className="hover:text-slate-900" href="https://kineticgain.com" target="_blank" rel="noreferrer">
          kineticgain.com
        </a>
      </div>
    </footer>
  );
}
