import { BookOpen, Bot, Check, Clipboard, Lightbulb, LoaderCircle, Send, Sparkles, UserRound } from 'lucide-react';

const suggestedQuestions = [
  'Summarize the central argument',
  'What should I remember for an exam?',
  'Explain the hardest idea simply'
];

export default function ChatWorkspace({
  selectedDocument,
  question,
  answer,
  loadingAnswer,
  confidence,
  statusMessage,
  onQuestionChange,
  onAsk,
  onSuggestion,
  onCopy
}) {
  const hasDocument = Boolean(selectedDocument);

  return (
    <section className="flex min-h-[calc(100vh-250px)] min-w-0 flex-1 flex-col bg-[#f5f6f0] md:min-h-screen xl:min-h-0 xl:overflow-y-auto">
      <header className="flex items-center justify-between border-b border-[#dfe3d8] px-6 py-4 lg:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e4ebd2] text-[#53653b]"><BookOpen size={17} /></div>
          <div className="min-w-0">
            <p className="section-label text-[#89917f]">Active study room</p>
            <h1 className="truncate font-display text-lg font-semibold tracking-tight text-[#20251e]">{selectedDocument?.filename || 'Choose a document to begin'}</h1>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-[#dfe3d8] bg-white px-3 py-1.5 text-xs text-[#6c7467] sm:flex">
          <span className="size-1.5 rounded-full bg-[#9aca4c]" /> {statusMessage}
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-end px-5 py-7 lg:px-16 lg:py-12">
        {!answer || answer.startsWith('Upload a PDF') ? (
          <div className="mx-auto mb-8 max-w-xl text-center">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#e5ebd8] text-[#637b3d]"><Sparkles size={24} /></div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#20251e]">Make your reading time count.</h2>
            <p className="mt-3 text-sm leading-6 text-[#778071]">Upload a study document and ask anything. Lumen will find the evidence first, then explain it clearly.</p>
          </div>
        ) : (
          <div className="mx-auto mb-8 w-full max-w-3xl space-y-6">
            <div className="flex gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#dce8bd] text-[#526737]"><Bot size={16} /></div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#89917f]">Lumen · grounded answer</p><span className="text-xs text-[#89917f]">{Math.round(confidence * 100)}% match</span></div>
                <div className="rounded-2xl rounded-tl-sm border border-[#dfe3d8] bg-white p-5 text-[15px] leading-7 text-[#343b31] shadow-[0_8px_24px_rgba(54,65,42,0.05)]">{answer}</div>
                <div className="mt-2 flex items-center gap-1">
                  <button className="subtle-button" type="button" onClick={onCopy}><Clipboard size={13} /> Copy</button>
                  <button className="subtle-button" type="button"><Check size={13} /> Grounded in sources</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedQuestions.map((suggestion) => <button className="suggestion" key={suggestion} type="button" disabled={!hasDocument || loadingAnswer} onClick={() => onSuggestion(suggestion)}><Lightbulb size={13} />{suggestion}</button>)}
          </div>
          <form className="relative" onSubmit={onAsk}>
            <textarea className="field min-h-[112px] resize-none rounded-2xl border-[#d5dccb] bg-white p-4 pb-14 pr-14 text-sm leading-6 text-[#20251e] shadow-[0_8px_28px_rgba(54,65,42,0.06)] placeholder:text-[#a3aa9c]" disabled={!hasDocument || loadingAnswer} placeholder="Ask a question about this document..." value={question} onChange={(event) => onQuestionChange(event.target.value)} />
            <button className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-xl bg-[#2c3725] text-[#e6f6a0] transition hover:bg-[#1e281b] disabled:cursor-not-allowed disabled:opacity-40" type="submit" disabled={!hasDocument || loadingAnswer || !question.trim()} title="Ask question">
              {loadingAnswer ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={17} />}
            </button>
          </form>
          <p className="mt-3 text-center text-[11px] text-[#9aa193]">Lumen can make mistakes. Check the evidence panel for the original context.</p>
        </div>
      </div>
    </section>
  );
}
