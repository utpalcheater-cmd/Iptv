import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { getGetProjectQueryKey, useGetProject } from '@workspace/api-client-react';
import { ErrorState, IconButton, LoadingState, Pill, PrimaryButton, ScreenShell } from '@/components/NabeenUI';
import { useColors } from '@/hooks/useColors';
import { usePersonalization } from '@/context/personalization';

export default function ProjectDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = useGetProject(id ?? '', { query: { enabled: Boolean(id), queryKey: getGetProjectQueryKey(id ?? '') } });
  const { track } = usePersonalization();

  if (project.isLoading) return <ScreenShell scroll={false}><LoadingState label="Opening your project" /></ScreenShell>;
  if (project.isError || !project.data) return <ScreenShell scroll={false}><ErrorState onRetry={() => project.refetch()} /></ScreenShell>;

  const data = project.data;
  return (
    <ScreenShell>
      <View style={styles.topBar}><IconButton icon="arrow-left" label="Back to projects" onPress={() => router.back()} /><Pill text={data.status === 'active' ? 'Active' : 'Archived'} tone={data.status === 'active' ? 'success' : 'neutral'} /></View>
      <View style={[styles.hero, { backgroundColor: colors.sidebar }]}>
        <View style={[styles.projectIcon, { backgroundColor: colors.accent }]}><Feather name="code" size={24} color={colors.sidebar} /></View>
        <Text style={[styles.projectName, { color: colors.sidebarForeground }]}>{data.name}</Text>
        <Text style={[styles.projectDescription, { color: colors.sidebarForeground }]}>{data.description || 'A fresh space for your next idea.'}</Text>
        <View style={styles.heroMeta}><Text style={[styles.heroMetaText, { color: colors.sidebarForeground }]}>{data.language}</Text><Text style={[styles.heroMetaText, { color: colors.sidebarForeground }]}>{data.visibility}</Text><Text style={[styles.heroMetaText, { color: colors.sidebarForeground }]}>{data.slug}</Text></View>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Workspace entry</Text>
      <View style={[styles.workspaceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.workspaceIcon, { backgroundColor: colors.cyanSoft }]}><Feather name="layers" size={20} color={colors.secondaryForeground} /></View>
        <Text style={[styles.workspaceTitle, { color: colors.foreground }]}>Continue in workspace</Text>
        <Text style={[styles.workspaceDetail, { color: colors.mutedForeground }]}>The mobile shell is ready to keep your project close. Code, preview, and deploy surfaces will follow the same project context.</Text>
        <PrimaryButton label="Open workspace" icon="arrow-up-right" onPress={() => { track('open_workspace'); Alert.alert('Workspace ready', 'nabeen remembered this project as part of your build rhythm.'); }} />
      </View>
      <View style={[styles.capabilityRow, { backgroundColor: colors.amberSoft }]}>
        <Feather name="info" size={17} color={colors.accentForeground} />
        <Text style={[styles.capabilityText, { color: colors.accentForeground }]}>Your project stays lightweight by default. Add capability surfaces only when your usage says they belong here.</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  hero: { borderRadius: 24, padding: 20, marginBottom: 26 },
  projectIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  projectName: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.8 },
  projectDescription: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, marginTop: 7, opacity: 0.75 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 },
  heroMetaText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize', opacity: 0.72 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 11 },
  workspaceCard: { borderWidth: 1, borderRadius: 20, padding: 17 },
  workspaceIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  workspaceTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  workspaceDetail: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, marginTop: 6, marginBottom: 17 },
  capabilityRow: { flexDirection: 'row', gap: 9, borderRadius: 16, padding: 14, marginTop: 14 },
  capabilityText: { flex: 1, fontSize: 11, fontFamily: 'Inter_500Medium', lineHeight: 17 },
});