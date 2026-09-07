import { FileText, FolderOpen, Plus, Search, SlidersHorizontal, Sparkles, Trash2 } from 'lucide-react';
import BrandMark from './BrandMark.jsx';

export default function DocumentSidebar({
  documents,
  selectedDocumentId,
  uploadFile,
  loadingUpload,
  onFileChange,
  onUpload,
  onSelect,
  onDelete,
  onSearchChange,
  searchTerm
}) {
  const filteredDocuments = documents.filter((document) =>
    document.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="flex min-h-0 w-full flex-col border-b border-[#30362d] bg-[#1c211b] lg:w-[292px] lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-5">
        <BrandMark />
        <button className="icon-button" title="Workspace settings" type="button"><SlidersHorizontal size={17} /></button>
      </div>

      <div className="px-4">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#d8f75b] px-4 py-3 text-sm font-semibold text-[#172014] transition hover:bg-[#e5ff81]">
          <Plus size={17} />
          Add document
          <input accept="application/pdf" className="hidden" type="file" onChange={onFileChange} />
        </label>
        <form className="mt-4" onSubmit={onUpload}>
          {uploadFile && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-[#414a3c] bg-[#272e25] px-3 py-2 text-xs text-[#d9dfd1]">
              <FileText size={14} className="shrink-0 text-[#d8f75b]" />
              <span className="min-w-0 flex-1 truncate">{uploadFile.name}</span>
              <button className="text-[#d8f75b]" type="submit" disabled={loadingUpload}>{loadingUpload ? '...' : 'Index'}</button>
            </div>
          )}
        </form>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col px-4 pb-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="section-label">Library</p>
          <span className="text-xs text-[#747c70]">{documents.length}</span>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747c70]" size={15} />
          <input className="field h-9 pl-9 text-xs" placeholder="Find a document" value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} />
        </div>
        <div className="scrollbar-thin min-h-0 space-y-1 overflow-y-auto">
          {filteredDocuments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#3a4236] px-4 py-6 text-center text-xs leading-5 text-[#81877c]">
              Your library is waiting for its first document.
            </div>
          ) : filteredDocuments.map((document) => (
            <div className={`group flex items-center gap-2 rounded-xl p-2 transition ${document.documentId === selectedDocumentId ? 'bg-[#303a29] text-[#f5f4ee]' : 'text-[#9da59a] hover:bg-[#272e25]'}`} key={document.documentId}>
              <button className="flex min-w-0 flex-1 items-center gap-3 text-left" type="button" onClick={() => onSelect(document.documentId)}>
                <div className={`grid size-8 shrink-0 place-items-center rounded-lg ${document.documentId === selectedDocumentId ? 'bg-[#d8f75b] text-[#172014]' : 'bg-[#30372e] text-[#aeb8a5]'}`}>
                  <FileText size={15} />
                </div>
                <span className="min-w-0">
                  <strong className="block truncate text-xs font-medium">{document.filename}</strong>
                  <span className="mt-1 block text-[10px] text-[#81877c]">{document.pageCount || 0} pages · {document.status === 'ready' ? 'Indexed' : document.status || 'Processing'}</span>
                </span>
              </button>
              <button className="invisible rounded-lg p-1.5 text-[#81877c] hover:bg-[#414a3c] hover:text-[#f5f4ee] group-hover:visible" title="Delete document" type="button" onClick={() => onDelete(document.documentId)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#30362d] p-4">
        <div className="flex items-start gap-3 rounded-xl bg-[#252c22] p-3">
          <Sparkles className="mt-0.5 shrink-0 text-[#d8f75b]" size={16} />
          <div>
            <p className="text-xs font-semibold text-[#e8eddc]">Study mode</p>
            <p className="mt-1 text-[11px] leading-4 text-[#81877c]">Answers stay grounded in your uploaded sources.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
