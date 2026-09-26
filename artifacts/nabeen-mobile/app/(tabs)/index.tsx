import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getGetDashboardQueryKey, useGetDashboard } from '@workspace/api-client-react';
import { ActivityRow, BrandMark, ErrorState, LoadingState, Pill, ProjectCard, ScreenShell, SectionTitle } from '@/components/NabeenUI';
import { useColors } from '@/hooks/useColors';
import { usePersonalization } from '@/context/personalization';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const dashboard = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey(), staleTime: 30_000 } });
  const { isRegular, focusLabel, progress, track } = usePersonalization();

  if (dashboard.isLoading) return <ScreenShell scroll={false}><LoadingState /></ScreenShell>;
  if (dashboard.isError || !dashboard.data) return <ScreenShell scroll={false}><ErrorState onRetry={() => dashboard.refetch()} /></ScreenShell>;

  const data = dashboard.data;
  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <View style={styles.brandLockup}>
          <BrandMark size={38} />
          <View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>nabeen</Text>
            <Text style={[styles.brandSub, { color: colors.mutedForeground }]}>PERSONAL BUILD SPACE</Text>
          </View>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.sidebar }]}><Text style={[styles.avatarText, { color: colors.accent }]}>N</Text></View>
      </View>

      <Text style={[styles.eyebrow, { color: colors.primary }]}>Your workspace</Text>
      <Text style={[styles.heroTitle, { color: colors.foreground }]}>{data.greeting}</Text>
      <Text style={[styles.heroDetail, { color: colors.mutedForeground }]}>A focused space to start, shape, and ship what you are thinking about.</Text>

      <View style={[styles.regularCard, { backgroundColor: colors.sidebar }]}>
        <View style={styles.regularTop}>
          <View>
            <Text style={[styles.regularEyebrow, { color: colors.accent }]}>{isRegular ? 'REGULAR BUILDER' : 'YOUR BUILD RHYTHM'}</Text>
            <Text style={[styles.regularTitle, { color: colors.sidebarForeground }]}>{isRegular ? 'nabeen knows your rhythm.' : 'Make the first move small.'}</Text>
          </View>
          <Feather name={isRegular ? 'award' : 'compass'} size={26} color={colors.accent} />
        </View>
        <Text style={[styles.regularDetail, { color: colors.sidebarForeground }]}>{isRegular ? `You are in ${focusLabel.toLowerCase()} most often. Your shortcuts will keep adapting.` : 'Open a project, try a build action, and nabeen will shape your shortcuts around you.'}</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${Math.max(8, progress)}%` }]} /></View>
        <Text style={[styles.progressLabel, { color: colors.sidebarForeground }]}>{Math.min(100, progress)}% of your regular-builder profile</Text>
      </View>

      <SectionTitle title="Workspace pulse" />
      <View style={styles.statsGrid}>
        {[
          { label: 'Projects', value: String(data.stats.totalProjects), icon: 'folder' as const },
          { label: 'Active', value: String(data.stats.activeProjects), icon: 'zap' as const },
          { label: 'Deployments', value: String(data.stats.deployments), icon: 'send' as const },
          { label: 'Storage', value: data.stats.storageUsed, icon: 'database' as const },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name={stat.icon} size={16} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <SectionTitle title="Continue building" action="All projects" onAction={() => router.push('/projects')} />
      {data.featuredProject ? (
        <ProjectCard
          project={data.featuredProject}
          onPress={() => {
            track('open_project');
            router.push({ pathname: '/project/[id]', params: { id: data.featuredProject?.id ?? '' } });
          }}
        />
      ) : null}

      <View style={[styles.actionCard, { backgroundColor: colors.cyanSoft }]}>
        <View style={[styles.actionIcon, { backgroundColor: colors.sidebar }]}><Feather name="plus" size={18} color={colors.accent} /></View>
        <View style={styles.actionCopy}>
          <Text style={[styles.actionTitle, { color: colors.foreground }]}>Start a new project</Text>
          <Text style={[styles.actionDetail, { color: colors.mutedForeground }]}>Pick a language and turn the next thought into something real.</Text>
        </View>
        <Pressable testID="start-project" onPress={() => router.push('/projects')} hitSlop={8}><Feather name="arrow-up-right" size={18} color={colors.primary} /></Pressable>
      </View>

      <SectionTitle title="Recent activity" action="View all" onAction={() => { track('view_activity'); router.push('/activity'); }} />
      {data.recentActivity.map((activity) => <ActivityRow key={activity.id} {...activity} />)}
      <Pressable onPress={() => { track('view_capabilities'); router.push('/capabilities'); }} style={styles.capabilityLink}>
        <Pill text="Capability map" tone="accent" />
        <Text style={[styles.capabilityText, { color: colors.foreground }]}>See what nabeen can grow into</Text>
        <Feather name="arrow-right" size={16} color={colors.primary} />
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  brandSub: { fontSize: 8, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.1, marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { fontSize: 33, fontFamily: 'Inter_700Bold', letterSpacing: -1.2, maxWidth: 330 },
  heroDetail: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, marginTop: 9, maxWidth: 330 },
  regularCard: { borderRadius: 22, padding: 18, marginTop: 22 },
  regularTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  regularEyebrow: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, marginBottom: 8 },
  regularTitle: { fontSize: 21, fontFamily: 'Inter_700Bold', letterSpacing: -0.5, maxWidth: 260 },
  regularDetail: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, marginTop: 12, maxWidth: 300 },
  progressTrack: { height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.14)', marginTop: 16, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  progressLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 8, opacity: 0.7 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', borderWidth: 1, borderRadius: 17, padding: 13, minHeight: 87 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold', marginTop: 6 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 2 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 18, padding: 14, marginTop: 4 },
  actionIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1 },
  actionTitle: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  actionDetail: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16, marginTop: 2 },
  capabilityLink: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 16 },
  capabilityText: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});