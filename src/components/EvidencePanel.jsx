import { BarChart3, ChevronRight, FileSearch, Layers3 } from 'lucide-react';

export default function EvidencePanel({ citations, sources, confidence, stats }) {
  return (
    <aside className="w-full border-t border-[#30362d] bg-[#20261e] text-[#eef2e6] lg:w-[330px] lg:border-l lg:border-t-0">
      <div className="flex items-center justify-between border-b border-[#30362d] px-5 py-5">
        <div><p className="section-label text-[#89917f]">Answer context</p><h2 className="mt-1 font-display text-lg font-semibold">Evidence</h2></div>
        <FileSearch className="text-[#d8f75b]" size={19} />
      </div>
      <div className="grid grid-cols-3 divide-x divide-[#30362d] border-b border-[#30362d]">
        <Metric label="Docs" value={stats.documents} />
        <Metric label="Pages" value={stats.pages} />
        <Metric label="Chunks" value={stats.chunks} />
      </div>
      <div className="p-5">
        <div className="mb-6 rounded-2xl border border-[#394331] bg-[#283123] p-4">
          <div className="mb-3 flex items-center justify-between"><span className="text-xs text-[#a7b19d]">Retrieval confidence</span><BarChart3 size={16} className="text-[#d8f75b]" /></div>
          <div className="flex items-end gap-2"><strong className="font-display text-3xl font-semibold text-[#f4f7eb]">{Math.round(confidence * 100)}%</strong><span className="pb-1 text-xs text-[#9aa991]">top match</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#3b4534]"><div className="h-full rounded-full bg-[#d8f75b] transition-all" style={{ width: `${Math.min(100, confidence * 100)}%` }} /></div>
        </div>
        <div className="mb-3 flex items-center justify-between"><p className="section-label text-[#89917f]">Retrieved passages</p><Layers3 size={15} className="text-[#89917f]" /></div>
        {sources.length === 0 ? <div className="rounded-xl border border-dashed border-[#3a4435] px-4 py-6 text-center text-xs leading-5 text-[#818b7a]">Ask a question to see the passages supporting your answer.</div> : <div className="space-y-3">{sources.map((source, index) => <article className="group rounded-xl border border-[#35402f] bg-[#252d22] p-3 transition hover:border-[#72894b]" key={source.chunkId}><div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d8f75b]">Source 0{index + 1}</span><span className="text-[10px] text-[#89917f]">p. {source.pageRange}</span></div><p className="line-clamp-4 text-xs leading-5 text-[#bdc7b6]">{source.preview}</p><button className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#d8f75b] opacity-80 group-hover:opacity-100" type="button">View source <ChevronRight size={13} /></button></article>)}</div>}
        {citations.length > 0 && <p className="mt-5 text-[11px] leading-5 text-[#818b7a]">{citations.length} source{citations.length === 1 ? '' : 's'} informed this response.</p>}
      </div>
    </aside>
  );
}

function Metric({ label, value }) {
  return <div className="px-2 py-4 text-center"><strong className="block font-display text-lg font-semibold">{value}</strong><span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[#89917f]">{label}</span></div>;
}
