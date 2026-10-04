import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetAgentBootstrapQueryKey,
  getGetAgentProjectFileQueryKey,
  getListAgentConversationMessagesQueryKey,
  getListAgentProjectFilesQueryKey,
  useCreateAgentProject,
  useDeleteAgentMemory,
  useGetAgentBootstrap,
  useGetAgentProjectFile,
  useListAgentConversationMessages,
  useListAgentProjectFiles,
  useSaveAgentProjectFile,
} from '@workspace/api-client-react';
import type { AgentMessage } from '@workspace/api-client-react';
import {
  Bot,
  Check,
  Code2,
  FileCode2,
  FolderCode,
  History,
  LoaderCircle,
  MessageSquareText,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import './agent-workbench.css';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} b`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} mb`;
}

function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved memory';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function SkeletonRows({ count = 4 }: { count?: number }) {
  return <div className="aw-skeleton" aria-label="Loading">
    {Array.from({ length: count }).map((_, index) => <div key={index} className="aw-skeleton-line" style={{ width: `${58 + ((index * 19) % 35)}%` }} />)}
  </div>;
}

function parseEvent(block: string): { event: string; data: string } | null {
  let event = 'message';
  const data: string[] = [];
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    if (line.startsWith('data:')) data.push(line.slice(5).trim());
  }
  return data.length ? { event, data: data.join('\n') } : null;
}

export default function AgentWorkbench() {
  const queryClient = useQueryClient();
  const bootstrap = useGetAgentBootstrap({ query: { queryKey: getGetAgentBootstrapQueryKey() } });
  const [projectId, setProjectId] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [selectedFileId, setSelectedFileId] = useState('');
  const [draftFilePath, setDraftFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [streamStatus, setStreamStatus] = useState('');
  const [streamError, setStreamError] = useState('');
  const [optimisticUserText, setOptimisticUserText] = useState('');
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectLanguage, setProjectLanguage] = useState('TypeScript');
  const [projectDescription, setProjectDescription] = useState('');
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const [notice, setNotice] = useState('');
  const [deletePendingId, setDeletePendingId] = useState('');
  const initializedFileKey = useRef('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const projects = bootstrap.data?.projects ?? [];
  const activeProject = projects.find((project) => project.id === projectId);
  const conversations = useMemo(
    () => (bootstrap.data?.conversations ?? []).filter((conversation) => conversation.projectId === projectId),
    [bootstrap.data?.conversations, projectId],
  );
  const files = useListAgentProjectFiles(projectId, {
    query: { enabled: !!projectId, queryKey: getListAgentProjectFilesQueryKey(projectId) },
  });
  const fileDetail = useGetAgentProjectFile(projectId, selectedFileId, {
    query: { enabled: !!projectId && !!selectedFileId, queryKey: getGetAgentProjectFileQueryKey(projectId, selectedFileId) },
  });
  const messagesQuery = useListAgentConversationMessages(conversationId, {
    query: { enabled: !!conversationId, queryKey: getListAgentConversationMessagesQueryKey(conversationId) },
  });
  const createProject = useCreateAgentProject();
  const saveFile = useSaveAgentProjectFile();
  const deleteMemory = useDeleteAgentMemory();

  useEffect(() => {
    if (!projectId && projects.length) {
      const first = projects[0];
      setProjectId(first.id);
      const latestConversation = (bootstrap.data?.conversations ?? []).find((item) => item.projectId === first.id);
      setConversationId(latestConversation?.id ?? '');
    } else if (projectId && projects.length && !projects.some((project) => project.id === projectId)) {
      setProjectId(projects[0].id);
      setConversationId('');
    }
  }, [bootstrap.data, projectId, projects]);

  useEffect(() => {
    if (selectedFileId && fileDetail.data && initializedFileKey.current !== `${projectId}/${selectedFileId}`) {
      initializedFileKey.current = `${projectId}/${selectedFileId}`;
      setFileContent(fileDetail.data.content);
      setDraftFilePath(fileDetail.data.path);
    }
    if (!selectedFileId && draftFilePath) initializedFileKey.current = '';
  }, [draftFilePath, fileDetail.data, projectId, selectedFileId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messagesQuery.data, streamText, streaming]);

  const selectedFile = files.data?.find((file) => file.id === selectedFileId);
  const editorPath = selectedFile?.path ?? draftFilePath;
  const editorContentIsLoaded = !selectedFileId || (!!fileDetail.data && initializedFileKey.current === `${projectId}/${selectedFileId}`);
  const fileIsDirty = !!editorPath && (!selectedFileId || fileContent !== fileDetail.data?.content);
  const lineCount = Math.max(1, fileContent.split('\n').length);
  const renderedMessages = (messagesQuery.data ?? []) as AgentMessage[];

  const setProject = (nextProjectId: string) => {
    setProjectId(nextProjectId);
    const nextConversation = (bootstrap.data?.conversations ?? []).find((conversation) => conversation.projectId === nextProjectId);
    setConversationId(nextConversation?.id ?? '');
    setSelectedFileId('');
    setDraftFilePath('');
    setFileContent('');
    initializedFileKey.current = '';
    setStreamError('');
    setStreamText('');
  };

  const openFile = (fileId: string) => {
    setSelectedFileId(fileId);
    setDraftFilePath('');
    setFileContent('');
    initializedFileKey.current = '';
  };

  const startNewFile = () => {
    setNewFilePath('');
    setNewFileDialogOpen(true);
  };

  const createLocalFileDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const path = newFilePath.trim().replace(/^\/+/, '');
    if (!path) return;
    setSelectedFileId('');
    setDraftFilePath(path);
    setFileContent('');
    initializedFileKey.current = '';
    setNewFileDialogOpen(false);
  };

  const saveCurrentFile = () => {
    if (!projectId || !editorPath || !fileIsDirty || saveFile.isPending) return;
    saveFile.mutate({ projectId, data: { path: editorPath, content: fileContent } }, {
      onSuccess: (savedFile) => {
        queryClient.setQueryData(getGetAgentProjectFileQueryKey(projectId, savedFile.id), savedFile);
        queryClient.invalidateQueries({ queryKey: getListAgentProjectFilesQueryKey(projectId) });
        setSelectedFileId(savedFile.id);
        setDraftFilePath(savedFile.path);
        setFileContent(savedFile.content);
        initializedFileKey.current = `${projectId}/${savedFile.id}`;
        setNotice('File saved to this project.');
        window.setTimeout(() => setNotice(''), 2600);
      },
      onError: () => {
        setNotice('The file could not be saved. Your edits are still here.');
        window.setTimeout(() => setNotice(''), 3200);
      },
    });
  };

  const createAgentProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = projectName.trim();
    if (!name) return;
    createProject.mutate({ data: { name, language: projectLanguage, description: projectDescription.trim() || undefined } }, {
      onSuccess: (created) => {
        queryClient.invalidateQueries({ queryKey: getGetAgentBootstrapQueryKey() });
        setProjectId(created.id);
        setConversationId('');
        setSelectedFileId('');
        setDraftFilePath('');
        setFileContent('');
        setProjectName('');
        setProjectDescription('');
        setProjectDialogOpen(false);
      },
      onError: () => setNotice('The project could not be created. Try again.'),
    });
  };

  const handleStreamEvent = (eventName: string, payload: unknown) => {
    const data = payload as Record<string, unknown>;
    if (eventName === 'conversation' && typeof data.conversationId === 'string') {
      setConversationId(data.conversationId);
      return;
    }
    if (eventName === 'status' && typeof data.message === 'string') {
      setStreamStatus(data.message);
      return;
    }
    if (eventName === 'delta' && typeof data.content === 'string') {
      setStreamText((current) => current + data.content);
      return;
    }
    if (eventName === 'error') {
      setStreamError(typeof data.error === 'string' ? data.error : 'The agent could not complete that request.');
      return;
    }
    if (eventName === 'done' && typeof data.conversationId === 'string') {
      const finishedConversationId = data.conversationId;
      setConversationId(finishedConversationId);
      queryClient.invalidateQueries({ queryKey: getGetAgentBootstrapQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListAgentConversationMessagesQueryKey(finishedConversationId) });
      if (projectId) queryClient.invalidateQueries({ queryKey: getListAgentProjectFilesQueryKey(projectId) });
      setOptimisticUserText('');
      setStreamStatus('');
      setStreamText('');
    }
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || !projectId || streaming) return;
    const currentConversationId = conversationId || null;
    setChatInput('');
    setOptimisticUserText(message);
    setStreaming(true);
    setStreamText('');
    setStreamStatus('Starting request');
    setStreamError('');
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, conversationId: currentConversationId, message }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed (${response.status})`);
      }
      if (!response.body) throw new Error('This response cannot be streamed in the current browser.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const consume = (chunk: string) => {
        buffer += chunk;
        let boundary = buffer.search(/\r?\n\r?\n/);
        while (boundary >= 0) {
          const frame = buffer.slice(0, boundary);
          const delimiter = buffer.slice(boundary).match(/^\r?\n\r?\n/)?.[0] ?? '\n\n';
          buffer = buffer.slice(boundary + delimiter.length);
          const parsed = parseEvent(frame);
          if (parsed) {
            try { handleStreamEvent(parsed.event, JSON.parse(parsed.data)); }
            catch { setStreamError('The agent sent a response that could not be read.'); }
          }
          boundary = buffer.search(/\r?\n\r?\n/);
        }
      };
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        consume(decoder.decode(value, { stream: true }));
      }
      consume(decoder.decode());
      if (buffer.trim()) {
        const parsed = parseEvent(buffer);
        if (parsed) {
          try { handleStreamEvent(parsed.event, JSON.parse(parsed.data)); }
          catch { setStreamError('The agent sent a response that could not be read.'); }
        }
      }
      setStreamStatus('');
      if (!streamText) {
        queryClient.invalidateQueries({ queryKey: getGetAgentBootstrapQueryKey() });
        if (conversationId) queryClient.invalidateQueries({ queryKey: getListAgentConversationMessagesQueryKey(conversationId) });
      }
    } catch (error) {
      setStreamError(error instanceof Error ? error.message : 'The request could not be sent.');
    } finally {
      setStreaming(false);
      setStreamStatus('');
    }
  };

  const removeMemory = (id: string) => {
    setDeletePendingId(id);
    deleteMemory.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAgentBootstrapQueryKey() });
        setDeletePendingId('');
      },
      onError: () => {
        setDeletePendingId('');
        setNotice('That memory could not be deleted.');
        window.setTimeout(() => setNotice(''), 2800);
      },
    });
  };

  if (bootstrap.isLoading) {
    return <div className="aw-page"><div className="aw-topline"><div><div className="aw-heading-kicker"><Sparkles /> Personal coding partner</div><h1 className="aw-title">Agent workbench</h1><p className="aw-subtitle">A quiet place to work through code, one project at a time.</p></div></div><div className="aw-layout"><div className="aw-pane"><SkeletonRows /></div><div className="aw-pane"><SkeletonRows count={8} /></div><div className="aw-pane"><SkeletonRows count={5} /></div></div></div>;
  }

  if (bootstrap.isError || !bootstrap.data) {
    return <div className="aw-page"><div className="aw-error-view"><div><Bot size={26} /><h2>The workbench did not open</h2><p>Your projects and personal context are still safe. Try loading them again.</p><button className="button button-secondary" onClick={() => bootstrap.refetch()} data-testid="button-agent-retry">Try again</button></div></div></div>;
  }

  const memories = bootstrap.data.memories ?? [];
  const createConversation = () => {
    setConversationId('');
    setOptimisticUserText('');
    setStreamText('');
    setStreamError('');
  };

  if (!projects.length) {
    return <div className="aw-page">
      <div className="aw-project-empty"><div className="aw-project-empty-card">
        <Sparkles />
        <h2>Set a place for the work.</h2>
        <p>Create a coding project and Nabeen will keep its files, conversations, and explicitly saved memories together.</p>
        <button className="button button-primary" onClick={() => setProjectDialogOpen(true)} data-testid="button-agent-create-first-project"><Plus /> Create a project</button>
      </div></div>
      {projectDialogOpen && <ProjectDialog onClose={() => setProjectDialogOpen(false)} onSubmit={createAgentProject} name={projectName} setName={setProjectName} language={projectLanguage} setLanguage={setProjectLanguage} description={projectDescription} setDescription={setProjectDescription} pending={createProject.isPending} />}
    </div>;
  }

  return <div className="aw-page">
    <header className="aw-topline">
      <div>
        <div className="aw-heading-kicker"><Sparkles /> Personal coding partner</div>
        <h1 className="aw-title">Agent workbench</h1>
        <p className="aw-subtitle">A focused space for the next useful change. Nabeen remembers only what you choose to save.</p>
      </div>
      <div className="aw-project-control" data-testid="control-agent-project">
        <span className="aw-project-glyph"><FolderCode /></span>
        <select className="aw-select" aria-label="Choose coding project" value={projectId} onChange={(event) => setProject(event.target.value)} data-testid="select-agent-project">
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
        <button className="aw-project-add" aria-label="Create coding project" title="Create a project" onClick={() => setProjectDialogOpen(true)} data-testid="button-agent-create-project"><Plus /></button>
      </div>
    </header>

    {!activeProject ? <div className="aw-error-view"><div><h2>Choose a project to begin</h2><button className="button button-secondary" onClick={() => bootstrap.refetch()}>Refresh projects</button></div></div> : <div className="aw-layout">
      <section className="aw-pane aw-left-pane" aria-label="Project files">
        <div className="aw-pane-head"><h2 className="aw-pane-title"><Code2 /> Files</h2><span className="aw-small-meta">{files.data?.length ?? 0} items</span></div>
        <div className="aw-project-note">{activeProject.description || `${activeProject.language} project · Files stay private to this workspace.`}</div>
        {files.isLoading ? <SkeletonRows count={5} /> : files.isError ? <div className="aw-error">Project files could not be loaded.<br /><button className="aw-outline-button" style={{ marginTop: 10 }} onClick={() => files.refetch()} data-testid="button-agent-files-retry">Try again</button></div> : !files.data?.length ? <div className="aw-empty" data-testid="status-agent-files-empty"><div><FileCode2 /><br />No files here yet.<br />Create a file draft or ask Nabeen to shape one.</div></div> : <div className="aw-file-list" data-testid="list-agent-files">
          {files.data.map((file) => <button key={file.id} className={`aw-file-row ${selectedFileId === file.id ? 'active' : ''}`} onClick={() => openFile(file.id)} data-testid={`button-agent-file-${file.id}`} title={file.path}>
            <FileCode2 /><span className="aw-file-path">{file.path}</span><span className="aw-file-size">{formatBytes(file.sizeBytes)}</span>
          </button>)}
        </div>}
        {draftFilePath && <button className="aw-file-row active" onClick={() => { setSelectedFileId(''); }} data-testid="button-agent-draft-file"><FileCode2 /><span className="aw-file-path">{draftFilePath}</span><span className="aw-small-meta">draft</span></button>}
        <div className="aw-left-bottom"><button className="aw-outline-button" onClick={startNewFile} data-testid="button-agent-new-file"><Plus /> New file draft</button></div>
      </section>

      <section className="aw-pane aw-center" aria-label="Code editor and conversation">
        <div className="aw-center-bar">
          <div className="aw-editor-caption"><FileCode2 /><strong data-testid="text-agent-current-file">{editorPath || 'Select a file'}</strong></div>
          <div className="aw-editor-tools">
            {fileIsDirty && <span className="aw-small-meta">Unsaved</span>}
            {!fileIsDirty && editorPath && <span className="aw-saved-label" data-testid="status-agent-file-saved"><Check /> Saved</span>}
            <button className="button button-primary aw-save-button" onClick={saveCurrentFile} disabled={!fileIsDirty || !editorPath || !editorContentIsLoaded || saveFile.isPending} data-testid="button-agent-save-file">
              {saveFile.isPending ? <LoaderCircle className="aw-spin" /> : <Check />} {saveFile.isPending ? 'Saving' : 'Save'}
            </button>
          </div>
        </div>
        <div className="aw-editor-wrap">
          <div className="aw-line-numbers" aria-hidden="true">{Array.from({ length: lineCount }, (_, index) => <div key={index}>{index + 1}</div>)}</div>
          {selectedFileId && fileDetail.isLoading ? <div style={{ flex: 1 }}><SkeletonRows count={7} /></div> : fileDetail.isError ? <div className="aw-error">This file could not be opened. Choose it again or retry.<button className="aw-outline-button" style={{ display: 'flex', marginTop: 9 }} onClick={() => fileDetail.refetch()} data-testid="button-agent-file-retry">Try again</button></div> : <textarea
            className="aw-code-editor"
            value={fileContent}
            onChange={(event) => setFileContent(event.target.value)}
            disabled={!editorPath || !editorContentIsLoaded}
            spellCheck={false}
            aria-label="Project file contents"
            placeholder={editorPath ? 'Write the file contents here…' : 'Choose a project file or create a file draft.'}
            data-testid="textarea-agent-file-content"
          />}
        </div>
        <div className="aw-conversation">
          <div className="aw-conversation-top">
            <h2 className="aw-conversation-heading"><MessageSquareText /> Conversation</h2>
            <button className="aw-outline-button" onClick={createConversation} disabled={streaming} data-testid="button-agent-new-conversation"><Plus /> New</button>
          </div>
          <div className="aw-chat-history" data-testid="list-agent-messages">
            {messagesQuery.isLoading && conversationId ? <div style={{ width: '100%' }}><SkeletonRows count={2} /></div> : messagesQuery.isError ? <div className="aw-error">Conversation history could not be loaded. <button className="aw-outline-button" onClick={() => messagesQuery.refetch()} data-testid="button-agent-messages-retry">Retry</button></div> : !conversationId && !optimisticUserText && !streaming ? <div className="aw-empty" style={{ minHeight: 74 }}><div>Start a conversation with a clear, specific coding request.</div></div> : null}
            {renderedMessages.map((message) => <article key={message.id} className={`aw-message ${message.role === 'user' ? 'user' : ''}`} data-testid={`message-agent-${message.id}`}><span className="aw-message-label">{message.role === 'user' ? 'You' : 'Nabeen'}</span>{message.content}</article>)}
            {optimisticUserText && <article className="aw-message user" data-testid="message-agent-pending-user"><span className="aw-message-label">You</span>{optimisticUserText}</article>}
            {streamStatus && <div className="aw-tool-status" data-testid="status-agent-stream"><i />{streamStatus}</div>}
            {(streamText || streaming) && <article className="aw-message aw-stream-message" data-testid="message-agent-streaming"><span className="aw-message-label">Nabeen</span>{streamText || <span className="aw-tool-status"><i />Thinking through the request</span>}</article>}
            {streamError && <div className="aw-error" role="alert" data-testid="status-agent-chat-error">{streamError}</div>}
            <div ref={chatEndRef} />
          </div>
          <form className="aw-chat-compose" onSubmit={sendMessage}>
            <textarea className="aw-chat-input" value={chatInput} onChange={(event) => setChatInput(event.target.value)} disabled={streaming} placeholder={projectId ? 'Ask for a code change, explanation, or review…' : 'Choose a project first'} aria-label="Coding request" data-testid="textarea-agent-request" onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
            <button className="aw-send-button" type="submit" aria-label={streaming ? 'Agent is responding' : 'Send coding request'} disabled={!chatInput.trim() || streaming || !projectId} data-testid="button-agent-send"><Send /></button>
          </form>
          <div className="aw-chat-hint">Enter to send · Shift + Enter for a new line</div>
        </div>
      </section>

      <aside className="aw-pane aw-right-pane" aria-label="Conversation history and saved memories">
        <div className="aw-pane-head"><h2 className="aw-pane-title"><History /> History</h2><span className="aw-small-meta">{conversations.length}</span></div>
        {conversations.length ? <div className="aw-history-list" data-testid="list-agent-conversations">
          {conversations.map((conversation) => <button key={conversation.id} className={`aw-history-button ${conversation.id === conversationId ? 'selected' : ''}`} onClick={() => { setConversationId(conversation.id); setStreamError(''); setStreamText(''); setOptimisticUserText(''); }} data-testid={`button-agent-conversation-${conversation.id}`}>
            <span className="aw-history-title">{conversation.title || 'Untitled conversation'}</span><span className="aw-history-time">{shortDate(conversation.updatedAt)}</span>
          </button>)}
        </div> : <div className="aw-empty" style={{ minHeight: 95 }} data-testid="status-agent-history-empty"><div>No conversations yet.<br />Your first request starts a new thread.</div></div>}
        <section className="aw-memory-section">
          <div className="aw-pane-head"><h2 className="aw-pane-title"><Sparkles /> Saved memories</h2><span className="aw-small-meta">{memories.length}</span></div>
          <p className="aw-memory-intro">Only details you explicitly ask Nabeen to remember appear here. Review or remove them any time.</p>
          {memories.length ? <div className="aw-memory-list" data-testid="list-agent-memories">
            {memories.map((memory) => <article className="aw-memory-card" key={memory.id} data-testid={`card-agent-memory-${memory.id}`}>
              <div className="aw-memory-top"><span className="aw-memory-category">{memory.category}</span><button className="aw-icon-action aw-memory-delete" aria-label={`Delete memory: ${memory.content}`} title="Delete saved memory" disabled={deleteMemory.isPending && deletePendingId === memory.id} onClick={() => removeMemory(memory.id)} data-testid={`button-agent-delete-memory-${memory.id}`}>{deletePendingId === memory.id ? <LoaderCircle /> : <Trash2 />}</button></div>
              <p className="aw-memory-text" data-testid={`text-agent-memory-${memory.id}`}>{memory.content}</p>
              <div className="aw-memory-date">Saved {shortDate(memory.createdAt)}</div>
            </article>)}
          </div> : <div className="aw-empty" style={{ minHeight: 110 }} data-testid="status-agent-memories-empty"><div>No saved memories.<br />Nothing is inferred or added on your behalf.</div></div>}
        </section>
      </aside>
    </div>}

    {projectDialogOpen && <ProjectDialog onClose={() => setProjectDialogOpen(false)} onSubmit={createAgentProject} name={projectName} setName={setProjectName} language={projectLanguage} setLanguage={setProjectLanguage} description={projectDescription} setDescription={setProjectDescription} pending={createProject.isPending} />}
    {newFileDialogOpen && <div className="aw-dialog-backdrop" role="presentation"><form className="aw-dialog" role="dialog" aria-modal="true" aria-labelledby="aw-file-title" onSubmit={createLocalFileDraft}>
      <div className="aw-dialog-heading"><div><h2 className="aw-dialog-title" id="aw-file-title">Start a file draft</h2><p className="aw-dialog-copy">Choose a project-relative path. The file is stored only when you save it.</p></div><button type="button" className="aw-icon-action" aria-label="Close" onClick={() => setNewFileDialogOpen(false)} data-testid="button-agent-close-new-file"><X /></button></div>
      <label className="aw-field"><span>File path</span><input autoFocus value={newFilePath} onChange={(event) => setNewFilePath(event.target.value)} placeholder="src/feature.ts" data-testid="input-agent-new-file-path" /></label>
      <div className="aw-dialog-actions"><button type="button" className="button button-secondary" onClick={() => setNewFileDialogOpen(false)} data-testid="button-agent-cancel-new-file">Cancel</button><button className="button button-primary" type="submit" disabled={!newFilePath.trim()} data-testid="button-agent-confirm-new-file">Open draft <FileCode2 /></button></div>
    </form></div>}
    {notice && <div className="notice" role="status" data-testid="status-agent-notice">{notice}</div>}
  </div>;
}

function ProjectDialog({
  onClose,
  onSubmit,
  name,
  setName,
  language,
  setLanguage,
  description,
  setDescription,
  pending,
}: {
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  name: string;
  setName: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  pending: boolean;
}) {
  return <div className="aw-dialog-backdrop" role="presentation"><form className="aw-dialog" role="dialog" aria-modal="true" aria-labelledby="aw-project-title" onSubmit={onSubmit}>
    <div className="aw-dialog-heading"><div><h2 className="aw-dialog-title" id="aw-project-title">Create a coding project</h2><p className="aw-dialog-copy">A dedicated shelf for files, requests, and the context you choose to keep.</p></div><button type="button" className="aw-icon-action" aria-label="Close dialog" onClick={onClose} data-testid="button-agent-close-project-dialog"><X /></button></div>
    <label className="aw-field"><span>Project name</span><input autoFocus maxLength={80} required value={name} onChange={(event) => setName(event.target.value)} placeholder="A small useful tool" data-testid="input-agent-project-name" /></label>
    <label className="aw-field"><span>Language</span><select value={language} onChange={(event) => setLanguage(event.target.value)} data-testid="select-agent-project-language"><option>TypeScript</option><option>JavaScript</option><option>Python</option><option>Go</option><option>Rust</option><option>Other</option></select></label>
    <label className="aw-field"><span>Description <small>(optional)</small></span><textarea maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What are you building?" data-testid="textarea-agent-project-description" /></label>
    <div className="aw-dialog-actions"><button type="button" className="button button-secondary" onClick={onClose} data-testid="button-agent-cancel-project">Cancel</button><button className="button button-primary" type="submit" disabled={!name.trim() || pending} data-testid="button-agent-submit-project">{pending ? 'Creating…' : 'Create project'} <Plus /></button></div>
  </form></div>;
}