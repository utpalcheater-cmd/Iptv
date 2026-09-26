import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetDashboardQueryKey,
  getListActivityQueryKey,
  getListProjectsQueryKey,
  useCreateProject,
  useListProjects,
} from '@workspace/api-client-react';
import { EmptyState, ErrorState, IconButton, LoadingState, Pill, PrimaryButton, ProjectCard, ScreenHeader, ScreenShell } from '@/components/NabeenUI';
import { useColors } from '@/hooks/useColors';
import { usePersonalization } from '@/context/personalization';

type ProjectFilter = 'all' | 'active' | 'archived';

export default function ProjectsScreen() {
  const colors = useColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { track } = usePersonalization();
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const projects = useListProjects(
    { q: search.trim() || undefined, status: filter },
    { query: { queryKey: getListProjectsQueryKey({ q: search.trim() || undefined, status: filter }), staleTime: 20_000 } },
  );
  const createProject = useCreateProject({
    mutation: {
      onSuccess: async (project) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }),
          queryClient.invalidateQueries({ queryKey: getListActivityQueryKey() }),
        ]);
        setModalVisible(false);
        setName('');
        setDescription('');
        track('create_project');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push({ pathname: '/project/[id]', params: { id: project.id } });
      },
    },
  });

  const filterLabel = useMemo(() => filter === 'all' ? 'All projects' : filter === 'active' ? 'Active only' : 'Archived only', [filter]);
  return (
    <>
      <ScreenShell>
        <ScreenHeader
          eyebrow="Workspace"
          title="Projects"
          detail="Your builds, kept close and easy to return to."
          right={<IconButton icon="plus" label="New project" onPress={() => setModalVisible(true)} />}
        />
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={17} color={colors.mutedForeground} />
          <TextInput
            testID="project-search"
            value={search}
            onChangeText={setSearch}
            placeholder="Find a project"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
          />
          {search ? <Pressable onPress={() => setSearch('')} hitSlop={8}><Feather name="x-circle" size={16} color={colors.mutedForeground} /></Pressable> : null}
        </View>
        <View style={styles.filterRow}>
          {(['all', 'active', 'archived'] as ProjectFilter[]).map((item) => (
            <Pressable
              key={item}
              testID={`filter-${item}`}
              onPress={() => setFilter(item)}
              style={[styles.filterPill, { backgroundColor: filter === item ? colors.sidebar : colors.muted }]}
            >
              <Text style={[styles.filterText, { color: filter === item ? colors.sidebarForeground : colors.mutedForeground }]}>{item === 'all' ? 'All' : item === 'active' ? 'Active' : 'Archived'}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.listHeading}>
          <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>{filterLabel}</Text>
          <Pill text={projects.data ? `${projects.data.length} found` : '...'} />
        </View>
        {projects.isLoading ? <LoadingState label="Finding your projects" /> : null}
        {projects.isError ? <ErrorState onRetry={() => projects.refetch()} /> : null}
        {projects.data?.length === 0 ? <EmptyState icon="folder-plus" title="No projects here yet" detail="Start with a small idea and let nabeen remember your rhythm." /> : null}
        {projects.data?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onPress={() => {
              track('open_project');
              router.push({ pathname: '/project/[id]', params: { id: project.id } });
            }}
          />
        ))}
      </ScreenShell>
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(15,23,37,0.54)' }]}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalEyebrow, { color: colors.primary }]}>New workspace</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Start something real.</Text>
              </View>
              <IconButton icon="x" label="Close new project" onPress={() => setModalVisible(false)} />
            </View>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Project name</Text>
            <TextInput
              testID="project-name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. studio-dashboard"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
              autoFocus
            />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>What is it about?</Text>
            <TextInput
              testID="project-description"
              value={description}
              onChangeText={setDescription}
              placeholder="A sentence is enough for now."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textInput, styles.multiline, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
              multiline
            />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Language</Text>
            <View style={styles.languageRow}>
              {['TypeScript', 'React', 'Python'].map((item) => (
                <Pressable key={item} onPress={() => setLanguage(item)} style={[styles.languagePill, { backgroundColor: language === item ? colors.cyanSoft : colors.muted, borderColor: language === item ? colors.success : colors.border }]}>
                  <Text style={[styles.languageText, { color: language === item ? colors.secondaryForeground : colors.mutedForeground }]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            {createProject.isError ? <Text style={[styles.errorText, { color: colors.destructive }]}>Could not create this project. Try again.</Text> : null}
            <PrimaryButton label={createProject.isPending ? 'Creating…' : 'Create project'} icon="arrow-up-right" disabled={!name.trim() || createProject.isPending} onPress={() => createProject.mutate({ data: { name, description, language, visibility: 'private' } })} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  searchBox: { height: 48, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', paddingVertical: 0 },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99 },
  filterText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  resultCount: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 },
  modalEyebrow: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 7 },
  modalTitle: { fontSize: 25, fontFamily: 'Inter_700Bold', letterSpacing: -0.6 },
  inputLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', marginBottom: 7, marginTop: 13 },
  textInput: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 13, fontSize: 13, fontFamily: 'Inter_400Regular' },
  multiline: { minHeight: 74, paddingTop: 12, textAlignVertical: 'top' },
  languageRow: { flexDirection: 'row', gap: 7, marginBottom: 18 },
  languagePill: { borderWidth: 1, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 99 },
  languageText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  errorText: { fontSize: 12, fontFamily: 'Inter_500Medium', marginBottom: 10 },
});