import { useEffect, useMemo, useState } from 'react';
import DocumentSidebar from './components/DocumentSidebar.jsx';
import ChatWorkspace from './components/ChatWorkspace.jsx';
import EvidencePanel from './components/EvidencePanel.jsx';

const initialStats = { documents: 0, pages: 0, chunks: 0 };

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState([]);
  const [sources, setSources] = useState([]);
  const [confidence, setConfidence] = useState(0);
  const [stats, setStats] = useState(initialStats);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');

  useEffect(() => { void loadDocuments(); }, []);

  const selectedDocument = useMemo(() => documents.find((document) => document.documentId === selectedDocumentId) ?? null, [documents, selectedDocumentId]);

  async function loadDocuments() {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      const nextDocuments = data.documents || [];
      setDocuments(nextDocuments);
      setSelectedDocumentId((current) => current || nextDocuments[0]?.documentId || '');
      setStats({ documents: nextDocuments.length, pages: nextDocuments.reduce((sum, document) => sum + (document.pageCount || 0), 0), chunks: nextDocuments.reduce((sum, document) => sum + (document.chunkCount || 0), 0) });
    } catch (_error) { setStatusMessage('Unable to load documents.'); }
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!uploadFile) return;
    setLoadingUpload(true); setStatusMessage('Indexing document...');
    try {
      const formData = new FormData(); formData.append('file', uploadFile);
      const response = await fetch('/api/documents', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed.');
      setUploadFile(null); await loadDocuments(); setSelectedDocumentId(data.document.documentId);
      setStatusMessage(data.warning ? 'Document indexed with limited text.' : 'Document indexed and ready.');
    } catch (error) { setStatusMessage(error instanceof Error ? error.message : 'Upload failed.'); }
    finally { setLoadingUpload(false); }
  }

  async function handleDelete(documentId) {
    if (!window.confirm('Remove this document from your library?')) return;
    try {
      const response = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to remove document.');
      if (selectedDocumentId === documentId) { setSelectedDocumentId(''); setAnswer(''); setSources([]); setCitations([]); setConfidence(0); }
      await loadDocuments(); setStatusMessage('Document removed.');
    } catch (error) { setStatusMessage(error instanceof Error ? error.message : 'Unable to remove document.'); }
  }

  async function handleAskQuestion(event) {
    event.preventDefault();
    if (!question.trim() || !selectedDocumentId) return;
    setLoadingAnswer(true); setStatusMessage('Searching your sources...');
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, documentId: selectedDocumentId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Question failed.');
      setAnswer(data.answer); setCitations(data.citations || []); setSources(data.sources || []); setConfidence(data.confidence || 0);
      setStatusMessage(data.answerSource === 'xai' ? 'Answer ready from xAI.' : 'Answer ready with local context.');
    } catch (error) { setStatusMessage(error instanceof Error ? error.message : 'Question failed.'); }
    finally { setLoadingAnswer(false); }
  }

  async function handleCopy() { await navigator.clipboard?.writeText(answer); setStatusMessage('Answer copied to clipboard.'); }

  return <main className="flex min-h-screen flex-col bg-[#1c211b] lg:flex-row">
    <DocumentSidebar documents={documents} selectedDocumentId={selectedDocumentId} uploadFile={uploadFile} loadingUpload={loadingUpload} onFileChange={(event) => setUploadFile(event.target.files?.[0] || null)} onUpload={handleUpload} onSelect={setSelectedDocumentId} onDelete={handleDelete} onSearchChange={setSearchTerm} searchTerm={searchTerm} />
    <ChatWorkspace selectedDocument={selectedDocument} question={question} answer={answer} loadingAnswer={loadingAnswer} confidence={confidence} statusMessage={statusMessage} onQuestionChange={setQuestion} onAsk={handleAskQuestion} onSuggestion={setQuestion} onCopy={handleCopy} />
    <EvidencePanel citations={citations} sources={sources} confidence={confidence} stats={stats} />
  </main>;
}