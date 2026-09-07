import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import {
  buildChunks,
  buildEmbedding,
  cosineSimilarity,
  normalizeText,
  topMatches
} from './vector.js';
import { generateGrokAnswer } from './grokClient.js';

const storageDirectory = path.join(process.cwd(), 'server', 'data');
const storagePath = path.join(storageDirectory, 'documents.json');
const documents = loadDocumentsFromDisk();
const maxChunkWords = Number(process.env.MAX_CHUNK_WORDS || 800);
const chunkOverlapWords = Number(process.env.CHUNK_OVERLAP_WORDS || 150);
const minimumSimilarity = Number(process.env.MINIMUM_SIMILARITY || 0.08);

export function getDocuments() {
  return documents.map(({ chunks, ...document }) => ({
    ...document,
    chunkCount: chunks.length
  }));
}

export function deleteDocument(documentId) {
  const documentIndex = documents.findIndex((document) => document.documentId === documentId);

  if (documentIndex === -1) {
    return false;
  }

  documents.splice(documentIndex, 1);
  saveDocumentsToDisk();
  return true;
}

export async function ingestPdfDocument({ buffer, filename }) {
  const documentId = `${Date.now()}-${sanitizeName(filename)}`;
  const baseDocument = {
    documentId,
    filename,
    uploadedAt: new Date().toISOString(),
    pageCount: 0,
    chunks: [],
    status: 'processing',
    error: null
  };

  let parsed;

  try {
    parsed = await pdf(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown PDF parse error';
    const document = {
      ...baseDocument,
      status: 'needs_text',
      error: `Failed to parse PDF: ${message}`
    };

    documents.unshift(document);
    saveDocumentsToDisk();

    return {
      documentId: document.documentId,
      filename: document.filename,
      pageCount: document.pageCount,
      chunkCount: 0,
      uploadedAt: document.uploadedAt,
      status: document.status,
      error: document.error
    };
  }

  const pages = String(parsed.text || '')
    .split(/\f/g)
    .map((pageText) => normalizeText(pageText))
    .filter((pageText) => pageText.length > 0);

  if (!pages.length) {
    const document = {
      ...baseDocument,
      status: 'needs_text',
      error: 'No extractable text was found in the PDF.'
    };

    documents.unshift(document);
    saveDocumentsToDisk();

    return {
      documentId: document.documentId,
      filename: document.filename,
      pageCount: document.pageCount,
      chunkCount: 0,
      uploadedAt: document.uploadedAt,
      status: document.status,
      error: document.error
    };
  }

  const chunks = buildChunks(pages, {
    maxWords: maxChunkWords,
    overlapWords: chunkOverlapWords
  }).map((chunk, index) => ({
    ...chunk,
    chunkId: `${Date.now()}-${index + 1}`,
    embedding: buildEmbedding(chunk.text)
  }));

  const document = {
    ...baseDocument,
    pageCount: pages.length,
    chunks,
    status: 'ready',
    error: null
  };

  documents.unshift(document);
  saveDocumentsToDisk();

  return {
    documentId: document.documentId,
    filename: document.filename,
    pageCount: document.pageCount,
    chunkCount: document.chunks.length,
    uploadedAt: document.uploadedAt
    ,status: document.status,
    error: document.error
  };
}

export async function answerQuestion({ question, documentId }) {
  const queryText = normalizeText(question);
  const documentsToSearch = documentId
    ? documents.filter((document) => document.documentId === documentId)
    : documents;

  if (!documentsToSearch.length) {
    return {
      answer: 'Upload a PDF document before asking questions.',
      citations: [],
      confidence: 0,
      sources: []
    };
  }

  const queryEmbedding = buildEmbedding(queryText);
  const candidates = documentsToSearch.flatMap((document) =>
    document.chunks.map((chunk) => ({
      ...chunk,
      documentId: document.documentId,
      filename: document.filename,
      pageRange: `${chunk.pageStart}-${chunk.pageEnd}`,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
    }))
  );

  const matches = topMatches(candidates, 5);

  if (!matches.length || matches[0].similarity < minimumSimilarity) {
    return {
      answer: 'Information not found in the uploaded document.',
      citations: [],
      confidence: Math.max(0, Number(matches[0]?.similarity?.toFixed(3) || 0)),
      sources: []
    };
  }

  if (!matches.length) {
    return {
      answer: 'Information not found in the uploaded document.',
      citations: [],
      confidence: 0,
      sources: []
    };
  }

  const context = matches
    .map((match, index) => `[Source ${index + 1} | ${match.filename} | pages ${match.pageRange}] ${match.text}`)
    .join('\n\n');

  const grokResult = await generateGrokAnswer({ question: queryText, context });
  const answer = grokResult.answer;

  return {
    answer,
    answerSource: grokResult.source,
    grokError: grokResult.error || null,
    confidence: Number(matches[0].similarity.toFixed(3)),
    citations: matches.map((match, index) => ({
      label: `Source ${index + 1}`,
      filename: match.filename,
      pageRange: match.pageRange,
      similarity: Number(match.similarity.toFixed(3))
    })),
    sources: matches.map((match) => ({
      chunkId: match.chunkId,
      filename: match.filename,
      pageRange: match.pageRange,
      preview: match.text.slice(0, 220)
    }))
  };
}

function sanitizeName(filename = 'document') {
  return path
    .basename(filename)
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'document';
}

function loadDocumentsFromDisk() {
  try {
    const storedDocuments = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
    return Array.isArray(storedDocuments) ? storedDocuments : [];
  } catch (_error) {
    return [];
  }
}

function saveDocumentsToDisk() {
  fs.mkdirSync(storageDirectory, { recursive: true });
  fs.writeFileSync(storagePath, JSON.stringify(documents), 'utf8');
}