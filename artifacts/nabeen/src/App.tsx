import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Box,
  Check,
  ChevronRight,
  CircleDashed,
  Code2,
  Command,
  Copy,
  FileCode2,
  FolderGit2,
  Globe2,
  Layers3,
  LayoutDashboard,
  Lightbulb,
  LockKeyhole,
  Menu,
  Pencil,
  Plus,
  Rocket,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  getGetDashboardQueryKey,
  getGetCapabilitiesQueryKey,
  getGetProjectQueryKey,
  getListActivityQueryKey,
  getListProjectsQueryKey,
  useCreateProject,
  useDeleteProject,
  useGetCapabilities,
  useGetDashboard,
  useGetProject,
  useListActivity,
  useListProjects,
  useUpdateProject,
} from '@workspace/api-client-react';
import type { Activity, Capability, Project } from '@workspace/api-client-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function formatDate(value: string, withYear = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' as const } : {}),
  }).format(date);
}

function relativeTime(value: string) {
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

function activityIcon(type: Activity['type']) {
  if (type === 'deployment') return <Rocket />;
  if (type === 'collaborator') return <Users />;
  if (type === 'project_archived') return <Archive />;
  if (type === 'project_updated') return <Pencil />;
  return <Plus />;
}

function capabilityIcon(label: string) {
  const value = label.toLowerCase();
  if (value.includes('deploy')) return <Rocket />;
  if (value.includes('file')) return <FileCode2 />;
  if (value.includes('collab')) return <Users />;
  if (value.includes('integrat')) return <Layers3 />;
  if (value.includes('ai') || value.includes('agent')) return <Sparkles />;
  return <Zap />;
}

type Notice = { message: string; tone?: 'success' | 'error' };

function AppShell({ children, showNotice }: { children: ReactNode; showNotice: (message: string, tone?: Notice['tone']) => void }) {
  const [location] = useLocation();
  const [railOpen, setRailOpen] = useState(false);
  const isActive = (href: string) => href === '/' ? location === '/' : location.startsWith(href);
  const nav = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: FolderGit2 },
    { href: '/activity', label: 'Activity', icon: CircleDashed },
    { href: '/capabilities', label: 'Capabilities', icon: Sparkles },
  ];
  return (
    <div className="nabeen-app">
      <aside className={`nabeen-rail ${railOpen ? 'open' : ''}`} data-testid="sidebar-navigation">
        <Link href="/" className="rail-brand" data-testid="link-brand">
          <span className="brand-mark"><span /></span>
          <span><span className="brand-name">nabeen</span><span className="brand-sub">personal command center</span></span>
        </Link>
        <div className="rail-section-label">Workspace</div>
        <nav className="rail-nav" aria-label="Workspace navigation">
          {nav.map((item) => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className={`rail-link ${isActive(item.href) ? 'active' : ''}`} onClick={() => setRailOpen(false)} data-testid={`link-nav-${item.label.toLowerCase()}`}><Icon /><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="rail-bottom">
          <div className="health-card" data-testid="status-workspace-health">
            <div className="health-title"><span>Workspace health</span><span className="health-dot" /></div>
            <p className="health-caption">All core systems are ready. Your next build is close.</p>
          </div>
          <Link href="/settings" className={`rail-link ${isActive('/settings') ? 'active' : ''}`} data-testid="link-nav-settings"><Settings2 /><span>Settings</span></Link>
          <div className="rail-profile">
            <span className="profile-orb">NW</span>
            <span className="profile-text"><span className="profile-name">Nabeen workspace</span><span className="profile-role">Personal space</span></span>
          </div>
        </div>
      </aside>
      {railOpen && <button className="mobile-only" aria-label="Close navigation" onClick={() => setRailOpen(false)} data-testid="button-close-navigation" />}
      <div className="nabeen-main">
        <header className="topbar">
          <div className="topbar-context"><strong>Personal workspace</strong><span> / </span><span>{location === '/' ? 'Overview' : location.split('/')[1]?.replace('-', ' ')}</span></div>
          <div className="topbar-actions">
            <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setRailOpen(true)} data-testid="button-open-navigation"><Menu /></button>
            <button className="icon-button" aria-label="Keyboard shortcuts" onClick={() => showNotice('Shortcuts are coming soon.')} data-testid="button-shortcuts"><Command /></button>
            <button className="icon-button" aria-label="Notifications" onClick={() => showNotice('You are all caught up.')} data-testid="button-notifications"><Bell /></button>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, intro, actions }: { eyebrow: string; title: string; intro?: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1 className="page-title">{title}</h1>{intro && <p className="page-intro">{intro}</p>}</div>{actions && <div className="heading-actions">{actions}</div>}</div>;
}

function LoadingPanel({ rows = 3 }: { rows?: number }) {
  return <div className="panel" aria-label="Loading"><div className="panel-header"><div className="skeleton" style={{ width: 130, height: 16 }} /><div className="skeleton" style={{ width: 60, height: 12 }} /></div>{Array.from({ length: rows }).map((_, i) => <div key={i} style={{ display: 'flex', gap: 12, padding: '18px 22px', borderBottom: '1px solid hsl(var(--border))' }}><div className="skeleton" style={{ width: 28, height: 28 }} /><div style={{ flex: 1 }}><div className="skeleton" style={{ width: `${45 + i * 12}%`, height: 12 }} /><div className="skeleton" style={{ width: '72%', height: 9, marginTop: 8 }} /></div></div>)}</div>;
}

function ErrorPanel({ onRetry }: { onRetry?: () => void }) {
  return <div className="panel error-state" data-testid="status-error"><p>We could not load this workspace view.</p>{onRetry && <button className="button button-secondary" onClick={onRetry} style={{ marginTop: 14 }} data-testid="button-retry">Try again</button>}</div>;
}

function EmptyState({ icon, title, copy, action }: { icon: ReactNode; title: string; copy: string; action?: ReactNode }) {
  return <div className="empty-state"><div><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{copy}</p>{action}</div></div>;
}

function ActivityList({ items, limit }: { items: Activity[]; limit?: number }) {
  const visible = limit ? items.slice(0, limit) : items;
  if (!visible.length) return <EmptyState icon={<CircleDashed />} title="No activity yet" copy="Your workspace story will start here when you create a project." />;
  return <div className="activity-list">{visible.map((item) => <div className="activity-row" key={item.id} data-testid={`row-activity-${item.id}`}><div className="activity-marker">{activityIcon(item.type)}</div><div><div className="activity-title" data-testid={`text-activity-title-${item.id}`}>{item.title}</div><div className="activity-detail">{item.detail}{item.projectName ? ` · ${item.projectName}` : ''}</div></div><div className="activity-time">{relativeTime(item.createdAt)}</div></div>)}</div>;
}

function DashboardPage({ showNotice }: { showNotice: (message: string, tone?: Notice['tone']) => void }) {
  const dashboard = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });
  if (dashboard.isLoading) return <div className="workspace"><PageHeading eyebrow="Today" title="Your command center" intro="A calm place to turn ideas into shipped work." /><div className="stats-grid">{Array.from({ length: 4 }).map((_, i) => <div className="panel stat-card" key={i}><div className="skeleton" style={{ width: 80, height: 12 }} /><div className="skeleton" style={{ width: 70, height: 28, marginTop: 20 }} /></div>)}</div><LoadingPanel /></div>;
  if (dashboard.isError || !dashboard.data) return <div className="workspace"><ErrorPanel onRetry={() => dashboard.refetch()} /></div>;
  const { stats, featuredProject, recentActivity } = dashboard.data;
  return <div className="workspace">
    <PageHeading eyebrow="Tuesday, your workspace" title={dashboard.data.greeting || 'Good to see you.'} intro="One focused place to start, shape, and ship the things you are thinking about." actions={<Link href="/projects" className="button button-primary" data-testid="link-create-project-heading"><Plus /> New project</Link>} />
    <div className="stats-grid">
      <StatCard icon={<FolderGit2 />} label="Total projects" value={stats.totalProjects} note="Across your workspace" />
      <StatCard icon={<Zap />} label="Active projects" value={stats.activeProjects} note="Ready to keep moving" />
      <StatCard icon={<Rocket />} label="Deployments" value={stats.deployments} note="A little momentum" />
      <StatCard icon={<Box />} label="Storage used" value={stats.storageUsed} note="Workspace capacity" />
    </div>
    <div className="dashboard-grid">
      <div className="panel feature-card" style={{ '--feature-accent': featuredProject?.accent || 'hsl(var(--sidebar-primary))' } as CSSProperties} data-testid="card-featured-project">
        {featuredProject ? <><div className="feature-kicker">Continue building</div><h2 className="feature-title">{featuredProject.name}</h2><p className="feature-copy">{featuredProject.description || 'Your project is ready for its next thoughtful iteration.'}</p><div className="feature-bottom"><span className="feature-slug">{featuredProject.slug} · {featuredProject.language}</span><Link href={`/projects/${featuredProject.id}`} className="button button-primary" data-testid="link-open-featured-project">Open workspace <ArrowUpRight /></Link></div></> : <><div className="feature-kicker">Start with a clean slate</div><h2 className="feature-title">Give the next idea somewhere to grow.</h2><p className="feature-copy">Create a project and nabeen will keep the surface clear while you build.</p><div className="feature-bottom"><span className="feature-slug">your first workspace</span><Link href="/projects" className="button button-primary" data-testid="link-create-first-project">Create project <Plus /></Link></div></>}
      </div>
      <div className="panel"><div className="panel-header"><span className="panel-title">Recent activity</span><Link href="/activity" className="panel-meta" data-testid="link-view-all-activity">View all <ChevronRight style={{ verticalAlign: 'middle', width: 13 }} /></Link></div><ActivityList items={recentActivity || []} limit={4} /></div>
    </div>
    <div className="panel section-gap" style={{ padding: 20 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15 }}><div><div className="eyebrow">Suggested next action</div><h2 style={{ marginTop: 8, font: '700 1.2rem Space Grotesk, sans-serif', letterSpacing: '-.04em' }}>Make the first move small.</h2><p className="muted" style={{ marginTop: 5, fontSize: '.76rem' }}>Pick one project and open its workspace. Progress likes a clear starting line.</p></div><button className="button button-secondary" onClick={() => showNotice('Your workspace is ready when you are.')} data-testid="button-suggested-action"><Lightbulb /> Got it</button></div></div>
  </div>;
}

function StatCard({ icon, label, value, note }: { icon: ReactNode; label: string; value: ReactNode; note: string }) {
  return <div className="panel stat-card" data-testid={`stat-${label.toLowerCase().replace(' ', '-')}`}><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value" data-testid={`value-${label.toLowerCase().replace(' ', '-')}`}>{value}</div><div className="stat-note">{note}</div></div>;
}

type ProjectFilter = 'all' | 'active' | 'archived';

function ProjectsPage({ showNotice, onCreate }: { showNotice: (message: string, tone?: Notice['tone']) => void; onCreate: () => void }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const params = useMemo(() => ({ q: search || undefined, status: filter === 'all' ? undefined : filter }), [filter, search]);
  const projects = useListProjects(params);
  const queryClient = useQueryClient();
  const update = useUpdateProject();
  const remove = useDeleteProject();
  const archive = (project: Project) => update.mutate({ id: project.id, data: { status: project.status === 'archived' ? 'active' : 'archived' } }, { onSuccess: (result) => { queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(result.id) }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); showNotice(result.status === 'archived' ? 'Project archived.' : 'Project restored.'); }, onError: () => showNotice('Could not update that project.', 'error') });
  const confirmDelete = () => { if (!deleteTarget) return; remove.mutate({ id: deleteTarget.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); setDeleteTarget(null); showNotice('Project deleted.'); }, onError: () => showNotice('Could not delete that project.', 'error') }); };
  return <div className="workspace">
    <PageHeading eyebrow="Workspace / Projects" title="Projects" intro="Keep every experiment, utility, and half-formed idea within reach." actions={<button className="button button-primary" onClick={onCreate} data-testid="button-open-create-project"><Plus /> New project</button>} />
    <div className="panel">
      <div className="search-row"><div className="search-wrap"><Search /><input className="input search-input" type="search" placeholder="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-search-projects" /></div><div className="filter-tabs" role="tablist" aria-label="Project status filter">{(['all', 'active', 'archived'] as ProjectFilter[]).map((item) => <button key={item} className={`filter-tab ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)} role="tab" data-testid={`button-filter-${item}`}>{item === 'all' ? 'All projects' : item[0].toUpperCase() + item.slice(1)}</button>)}</div></div>
      {projects.isLoading ? <LoadingPanel rows={4} /> : projects.isError ? <ErrorPanel onRetry={() => projects.refetch()} /> : !projects.data?.length ? <EmptyState icon={<FolderGit2 />} title={search ? 'Nothing matched that search' : 'Your project shelf is open'} copy={search ? 'Try a different project name or clear the search.' : 'Create a first project and give your next idea a home.'} action={!search && <button className="button button-primary" onClick={onCreate} data-testid="button-create-empty-project"><Plus /> Create project</button>} /> : <div style={{ overflowX: 'auto' }}><table className="project-table"><thead><tr><th>Project</th><th>Language</th><th>Status</th><th>Visibility</th><th>Updated</th><th /></tr></thead><tbody>{projects.data.map((project) => <tr key={project.id} data-testid={`row-project-${project.id}`}><td><div className="project-name-cell"><span className="project-swatch" style={{ background: project.accent }} /><span><Link className="project-name" href={`/projects/${project.id}`} data-testid={`link-project-${project.id}`}>{project.name}</Link><span className="project-slug">{project.slug}</span></span></div></td><td className="mono muted">{project.language}</td><td><span className={`status-pill ${project.status === 'active' ? 'status-active' : 'status-archived'}`}>{project.status}</span></td><td><span className="visibility-pill">{project.visibility === 'private' ? <LockKeyhole style={{ width: 13, verticalAlign: 'middle', marginRight: 5 }} /> : <Globe2 style={{ width: 13, verticalAlign: 'middle', marginRight: 5 }} />}{project.visibility}</span></td><td className="muted">{formatDate(project.updatedAt)}</td><td><div className="table-actions"><button className="table-action" title={project.status === 'archived' ? 'Restore project' : 'Archive project'} onClick={() => archive(project)} data-testid={`button-archive-project-${project.id}`}>{project.status === 'archived' ? <ArrowUpRight /> : <Archive />}</button><button className="table-action" title="Delete project" onClick={() => setDeleteTarget(project)} data-testid={`button-delete-project-${project.id}`}><Trash2 /></button></div></td></tr>)}</tbody></table></div>}
    </div>
    {deleteTarget && <div className="dialog-backdrop" role="presentation"><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title"><div className="dialog-header"><div><h2 className="dialog-title" id="delete-title">Delete {deleteTarget.name}?</h2><p className="dialog-copy">This permanently removes the project from your workspace. This action cannot be undone.</p></div><button className="icon-button" onClick={() => setDeleteTarget(null)} aria-label="Close dialog" data-testid="button-close-delete-dialog"><X /></button></div><div className="dialog-actions"><button className="button button-secondary" onClick={() => setDeleteTarget(null)} data-testid="button-cancel-delete">Keep project</button><button className="button button-danger" onClick={confirmDelete} disabled={remove.isPending} data-testid="button-confirm-delete">{remove.isPending ? 'Deleting…' : 'Delete project'}</button></div></div></div>}
  </div>;
}

function CreateProjectDialog({ open, onClose, showNotice }: { open: boolean; onClose: () => void; showNotice: (message: string, tone?: Notice['tone']) => void }) {
  const create = useCreateProject();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  if (!open) return null;
  const submit = () => {
    if (!name.trim()) { showNotice('Give your project a name first.', 'error'); return; }
    create.mutate({ data: { name: name.trim(), description: description.trim(), language, visibility } }, { onSuccess: (project) => { queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); setName(''); setDescription(''); onClose(); showNotice(`${project.name} is ready to build.`); }, onError: () => showNotice('Could not create that project.', 'error') });
  };
  return <div className="dialog-backdrop" role="presentation"><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="dialog-header"><div><h2 className="dialog-title" id="create-title">Start a project</h2><p className="dialog-copy">A clear name is enough. You can shape the rest as you go.</p></div><button className="icon-button" onClick={onClose} aria-label="Close dialog" data-testid="button-close-create-dialog"><X /></button></div><div className="form-stack"><label className="field"><span className="field-label">Project name</span><input className="input" autoFocus placeholder="e.g. Morning brief" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-project-name" /></label><label className="field"><span className="field-label">Description <span className="muted">(optional)</span></span><textarea className="textarea" placeholder="What are you making?" value={description} onChange={(e) => setDescription(e.target.value)} data-testid="input-project-description" /></label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><label className="field"><span className="field-label">Language</span><select className="select" value={language} onChange={(e) => setLanguage(e.target.value)} data-testid="select-project-language"><option>TypeScript</option><option>Python</option><option>JavaScript</option><option>Go</option><option>Rust</option></select></label><label className="field"><span className="field-label">Visibility</span><select className="select" value={visibility} onChange={(e) => setVisibility(e.target.value as 'private' | 'public')} data-testid="select-project-visibility"><option value="private">Private</option><option value="public">Public</option></select></label></div></div><div className="dialog-actions"><button className="button button-secondary" onClick={onClose} data-testid="button-cancel-create">Cancel</button><button className="button button-primary" onClick={submit} disabled={create.isPending} data-testid="button-submit-create">{create.isPending ? 'Creating…' : 'Create project'} <ArrowUpRight /></button></div></div></div>;
}

function ProjectPage({ showNotice }: { showNotice: (message: string, tone?: Notice['tone']) => void }) {
  const { id = '' } = useParams<{ id: string }>();
  const project = useGetProject(id, { query: { queryKey: getGetProjectQueryKey(id) } });
  const update = useUpdateProject();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  if (project.isLoading) return <div className="workspace"><PageHeading eyebrow="Project" title="Loading project" /><LoadingPanel rows={3} /></div>;
  if (project.isError || !project.data) return <div className="workspace"><ErrorPanel onRetry={() => project.refetch()} /></div>;
  const data = project.data;
  const beginEdit = () => { setName(data.name); setDescription(data.description); setEditing(true); };
  const save = () => update.mutate({ id: data.id, data: { name: name.trim(), description } }, { onSuccess: (result) => { queryClient.setQueryData(getGetProjectQueryKey(result.id), result); queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() }); setEditing(false); showNotice('Project details saved.'); }, onError: () => showNotice('Could not save project details.', 'error') });
  const copyLink = () => { void navigator.clipboard?.writeText(window.location.href); showNotice('Project link copied to your clipboard.'); };
  return <div className="workspace"><Link href="/projects" className="button button-secondary" style={{ marginBottom: 25 }} data-testid="link-back-projects"><ArrowLeft /> All projects</Link><div className="detail-layout"><div><div className="panel project-hero" style={{ '--feature-accent': data.accent } as CSSProperties}><div className="feature-kicker">{data.status === 'active' ? 'Active workspace' : 'Archived project'}</div><h2>{data.name}</h2><p>{data.description || 'No description yet. Every useful thing starts with a blank line.'}</p><div className="hero-actions"><button className="button button-primary" onClick={() => showNotice('Workspace entry is ready to connect to your builder.')} data-testid="button-enter-workspace"><Code2 /> Enter workspace <ArrowUpRight /></button><button className="button button-secondary" onClick={beginEdit} data-testid="button-edit-project"><Pencil /> Edit</button></div></div><div className="panel section-gap"><div className="panel-header"><span className="panel-title">Project activity</span><span className="panel-meta">A focused timeline</span></div><EmptyState icon={<CircleDashed />} title="Activity will appear here" copy="Changes, deployments, and collaborators will gather around this project as you build." /></div></div><div className="panel meta-panel"><div className="eyebrow">Project details</div><dl className="meta-list"><div className="meta-item"><dt>Slug</dt><dd className="mono">{data.slug}</dd></div><div className="meta-item"><dt>Language</dt><dd>{data.language}</dd></div><div className="meta-item"><dt>Status</dt><dd><span className={`status-pill ${data.status === 'active' ? 'status-active' : 'status-archived'}`}>{data.status}</span></dd></div><div className="meta-item"><dt>Visibility</dt><dd>{data.visibility}</dd></div><div className="meta-item"><dt>Created</dt><dd>{formatDate(data.createdAt, true)}</dd></div><div className="meta-item"><dt>Updated</dt><dd>{formatDate(data.updatedAt, true)}</dd></div></dl><div style={{ marginTop: 26, paddingTop: 18, borderTop: '1px solid hsl(var(--border))' }}><button className="button button-secondary" style={{ width: '100%' }} onClick={copyLink} data-testid="button-copy-project-link"><Copy /> Copy project link</button></div></div></div>{editing && <div className="dialog-backdrop" role="presentation"><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="edit-title"><div className="dialog-header"><div><h2 className="dialog-title" id="edit-title">Edit project</h2><p className="dialog-copy">Keep the project surface honest as it changes.</p></div><button className="icon-button" onClick={() => setEditing(false)} aria-label="Close dialog" data-testid="button-close-edit-dialog"><X /></button></div><div className="form-stack"><label className="field"><span className="field-label">Project name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-edit-project-name" /></label><label className="field"><span className="field-label">Description</span><textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} data-testid="input-edit-project-description" /></label></div><div className="dialog-actions"><button className="button button-secondary" onClick={() => setEditing(false)} data-testid="button-cancel-edit">Cancel</button><button className="button button-primary" onClick={save} disabled={update.isPending || !name.trim()} data-testid="button-save-edit">{update.isPending ? 'Saving…' : 'Save changes'} <Check /></button></div></div></div>}</div>;
}

function ActivityPage() {
  const activity = useListActivity({ limit: 50 }, { query: { queryKey: getListActivityQueryKey({ limit: 50 }) } });
  return <div className="workspace"><PageHeading eyebrow="Workspace / Activity" title="Activity" intro="A readable trail of what has changed, shipped, and started moving." />{activity.isLoading ? <LoadingPanel rows={7} /> : activity.isError ? <ErrorPanel onRetry={() => activity.refetch()} /> : <div className="panel"><div className="panel-header"><span className="panel-title">All workspace activity</span><span className="panel-meta">{activity.data?.length || 0} events</span></div><ActivityList items={activity.data || []} /></div>}</div>;
}

function CapabilitiesPage() {
  const capabilities = useGetCapabilities({ query: { queryKey: getGetCapabilitiesQueryKey() } });
  const grouped = useMemo(() => { const map = new Map<string, Capability[]>(); (capabilities.data || []).forEach((item) => map.set(item.category, [...(map.get(item.category) || []), item])); return Array.from(map.entries()); }, [capabilities.data]);
  return <div className="workspace"><PageHeading eyebrow="The nabeen horizon" title="Capabilities" intro="A small, opinionated toolkit for moving from first thought to something real." />{capabilities.isLoading ? <div className="capability-grid">{Array.from({ length: 6 }).map((_, i) => <div className="panel capability-card" key={i}><div className="skeleton" style={{ width: 34, height: 34 }} /><div className="skeleton" style={{ width: 130, height: 15, marginTop: 19 }} /><div className="skeleton" style={{ width: '90%', height: 10, marginTop: 10 }} /></div>)}</div> : capabilities.isError ? <ErrorPanel onRetry={() => capabilities.refetch()} /> : !capabilities.data?.length ? <div className="panel"><EmptyState icon={<Sparkles />} title="The toolkit is taking shape" copy="Capabilities will appear here as they become part of your workspace." /></div> : <div>{grouped.map(([category, items]) => <section key={category} style={{ marginBottom: 30 }}><div className="eyebrow" style={{ marginBottom: 12 }}>{category}</div><div className="capability-grid">{items.map((item) => <div className="panel capability-card" key={item.id} data-testid={`card-capability-${item.id}`}><div className="capability-icon">{capabilityIcon(item.label)}</div><span className={`capability-status ${item.status === 'coming_soon' ? 'soon' : ''}`}>{item.status === 'coming_soon' ? 'Coming soon' : 'Available'}</span><h3>{item.label}</h3><p>{item.description}</p></div>)}</div></section>)}</div>}</div>;
}

function SettingsPage({ showNotice }: { showNotice: (message: string, tone?: Notice['tone']) => void }) {
  const [active, setActive] = useState('Workspace');
  const [compact, setCompact] = useState(false);
  const [updates, setUpdates] = useState(true);
  const [profileName, setProfileName] = useState('Nabeen workspace');
  return <div className="workspace"><PageHeading eyebrow="Workspace / Settings" title="Settings" intro="A few quiet controls for how nabeen meets you each day." /><div className="settings-layout"><nav className="settings-nav" aria-label="Settings sections">{['Workspace', 'Notifications', 'Account'].map((item) => <button className={active === item ? 'active' : ''} key={item} onClick={() => setActive(item)} data-testid={`button-settings-${item.toLowerCase()}`}>{item}</button>)}</nav><div>{active === 'Workspace' && <section className="panel settings-section" data-testid="section-workspace-settings"><h2>Workspace preferences</h2><p>Make the command center feel like yours.</p><div className="settings-row"><div><div className="settings-row-title">Workspace name</div><div className="settings-row-copy">Shown in your sidebar and project context.</div></div><input className="input" style={{ maxWidth: 210 }} value={profileName} onChange={(e) => setProfileName(e.target.value)} data-testid="input-workspace-name" /></div><div className="settings-row"><div><div className="settings-row-title">Compact project rows</div><div className="settings-row-copy">Fit more of your project shelf on one screen.</div></div><button className={`switch ${compact ? 'on' : ''}`} aria-label="Toggle compact project rows" onClick={() => setCompact(!compact)} data-testid="switch-compact-projects" /></div><div className="settings-row"><div><div className="settings-row-title">Save changes</div><div className="settings-row-copy">Preferences stay local to this workspace for now.</div></div><button className="button button-primary" onClick={() => showNotice('Workspace preferences saved.')} data-testid="button-save-settings"><Check /> Save</button></div></section>}{active === 'Notifications' && <section className="panel settings-section"><h2>Notifications</h2><p>Keep the signal useful, not noisy.</p><div className="settings-row"><div><div className="settings-row-title">Workspace updates</div><div className="settings-row-copy">Receive a note when important project activity lands.</div></div><button className={`switch ${updates ? 'on' : ''}`} aria-label="Toggle workspace updates" onClick={() => setUpdates(!updates)} data-testid="switch-workspace-updates" /></div></section>}{active === 'Account' && <section className="panel settings-section"><h2>Account</h2><p>Your personal workspace identity.</p><div className="settings-row"><div><div className="settings-row-title">Signed in as</div><div className="settings-row-copy">nabeen@workspace.local</div></div><span className="profile-orb">NW</span></div><div className="settings-row"><div><div className="settings-row-title">Plan</div><div className="settings-row-copy">Personal workspace · building the basics first.</div></div><span className="status-pill status-active">Active</span></div></section>}</div></div></div>;
}

function Router() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const showNotice = (message: string, tone: Notice['tone'] = 'success') => { setNotice({ message, tone }); window.setTimeout(() => setNotice(null), 3200); };
  return <AppShell showNotice={showNotice}><Switch><Route path="/"><DashboardPage showNotice={showNotice} /></Route><Route path="/projects"><ProjectsPage showNotice={showNotice} onCreate={() => setCreateOpen(true)} /></Route><Route path="/projects/:id"><ProjectPage showNotice={showNotice} /></Route><Route path="/activity"><ActivityPage /></Route><Route path="/capabilities"><CapabilitiesPage /></Route><Route path="/settings"><SettingsPage showNotice={showNotice} /></Route><Route component={NotFound} /></Switch>{createOpen && <CreateProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} showNotice={showNotice} />}{notice && <div className="notice" data-testid="status-notice"><Check style={{ color: notice.tone === 'error' ? 'hsl(var(--destructive))' : undefined }} /><span>{notice.message}</span></div>}</AppShell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><Router /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;