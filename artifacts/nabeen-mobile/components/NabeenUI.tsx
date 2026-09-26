import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function BrandMark({ size = 38 }: { size?: number }) {
  const colors = useColors();
  return (
    <View style={[styles.brandMark, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: colors.accent }]}>
      <View style={[styles.brandCutout, { width: size * 0.36, height: size * 0.36, borderRadius: size * 0.12, backgroundColor: colors.sidebar }]} />
      <View style={[styles.brandDot, { width: size * 0.14, height: size * 0.14, borderRadius: size, backgroundColor: colors.primary }]} />
    </View>
  );
}

export function ScreenShell({
  children,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: object;
}) {
  const colors = useColors();
  if (!scroll) return <View style={[styles.shell, { backgroundColor: colors.background }, contentStyle]}>{children}</View>;
  return (
    <ScrollView
      style={[styles.shell, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  detail,
  right,
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
  right?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>{title}</Text>
        {detail ? <Text style={[styles.screenDetail, { color: colors.mutedForeground }]}>{detail}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  label?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityLabel={label}
      testID={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.68 : 1 }]}
    >
      <Feather name={icon} size={18} color={colors.foreground} />
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Pill({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'success' | 'accent' }) {
  const colors = useColors();
  const palette = tone === 'success'
    ? { backgroundColor: colors.secondary, color: colors.secondaryForeground }
    : tone === 'accent'
      ? { backgroundColor: colors.amberSoft, color: colors.accentForeground }
      : { backgroundColor: colors.muted, color: colors.mutedForeground };
  return <Text style={[styles.pill, palette]}>{text}</Text>;
}

export function PrimaryButton({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      testID={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: disabled ? 0.45 : pressed ? 0.82 : 1 }]}
    >
      {icon ? <Feather name={icon} size={16} color={colors.primaryForeground} /> : null}
      <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>{label}</Text>
    </Pressable>
  );
}

export function ProjectCard({
  project,
  onPress,
}: {
  project: {
    id: string;
    name: string;
    description: string;
    language: string;
    status: string;
    visibility: string;
    accent: string;
  };
  onPress?: () => void;
}) {
  const colors = useColors();
  const accentColor = project.accent === 'cyan' ? colors.success : project.accent === 'amber' ? colors.accent : colors.primary;
  return (
    <Pressable
      testID={`project-${project.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.projectCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.84 : 1 }]}
    >
      <View style={[styles.projectAccent, { backgroundColor: accentColor }]} />
      <View style={styles.projectCardBody}>
        <View style={styles.projectCardTop}>
          <View style={[styles.projectGlyph, { backgroundColor: colors.sidebar }]}>
            <Feather name="code" size={17} color={colors.accent} />
          </View>
          <Pill text={project.status === 'active' ? 'Active' : 'Archived'} tone={project.status === 'active' ? 'success' : 'neutral'} />
        </View>
        <Text style={[styles.projectName, { color: colors.foreground }]}>{project.name}</Text>
        <Text style={[styles.projectDescription, { color: colors.mutedForeground }]} numberOfLines={2}>{project.description || 'A fresh space for your next idea.'}</Text>
        <View style={styles.projectMeta}>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{project.language}</Text>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{project.visibility}</Text>
          <Feather name="arrow-up-right" size={14} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

export function LoadingState({ label = 'Loading your workspace' }: { label?: string }) {
  const colors = useColors();
  return <View style={styles.stateBox}><ActivityIndicator color={colors.primary} /><Text style={[styles.stateText, { color: colors.mutedForeground }]}>{label}</Text></View>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.stateBox}>
      <Feather name="wifi-off" size={22} color={colors.primary} />
      <Text style={[styles.stateTitle, { color: colors.foreground }]}>Couldn’t reach nabeen</Text>
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>Check your connection and try again.</Text>
      <Pressable onPress={onRetry} hitSlop={8}><Text style={[styles.sectionAction, { color: colors.primary }]}>Retry</Text></Pressable>
    </View>
  );
}

export function EmptyState({ icon, title, detail }: { icon: keyof typeof Feather.glyphMap; title: string; detail: string }) {
  const colors = useColors();
  return (
    <View style={styles.stateBox}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.coralSoft }]}><Feather name={icon} size={22} color={colors.primary} /></View>
      <Text style={[styles.stateTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>{detail}</Text>
    </View>
  );
}

export function ActivityRow({
  title,
  detail,
  projectName,
  createdAt,
  type,
}: {
  title: string;
  detail: string;
  projectName: string | null;
  createdAt: string | Date;
  type: string;
}) {
  const colors = useColors();
  const icon: keyof typeof Feather.glyphMap = type === 'deployment' ? 'send' : type === 'collaborator' ? 'users' : type === 'project_archived' ? 'archive' : 'plus';
  const date = new Date(createdAt);
  const time = Number.isNaN(date.getTime()) ? 'recently' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <View style={[styles.activityRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.activityIcon, { backgroundColor: colors.coralSoft }]}><Feather name={icon} size={15} color={colors.primary} /></View>
      <View style={styles.activityCopy}>
        <Text style={[styles.activityTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.activityDetail, { color: colors.mutedForeground }]} numberOfLines={2}>{detail}</Text>
        {projectName ? <Text style={[styles.activityProject, { color: colors.primary }]}>{projectName}</Text> : null}
      </View>
      <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
  brandMark: { alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  brandCutout: { position: 'absolute', left: '31%', top: '31%' },
  brandDot: { position: 'absolute', right: '20%', bottom: '20%' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  headerCopy: { flex: 1, paddingRight: 12 },
  eyebrow: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 8 },
  screenTitle: { fontSize: 30, fontFamily: 'Inter_700Bold', letterSpacing: -0.8 },
  screenDetail: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginTop: 6 },
  iconButton: { width: 42, height: 42, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  sectionAction: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  pill: { fontSize: 11, fontFamily: 'Inter_600SemiBold', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, overflow: 'hidden' },
  primaryButton: { minHeight: 48, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  primaryButtonText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  projectCard: { flexDirection: 'row', borderWidth: 1, borderRadius: 20, overflow: 'hidden', marginBottom: 12 },
  projectAccent: { width: 5 },
  projectCardBody: { flex: 1, padding: 16 },
  projectCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  projectGlyph: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  projectName: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 5 },
  projectDescription: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  projectMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 15 },
  metaText: { fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'capitalize' },
  stateBox: { alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 180, padding: 22 },
  stateTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  stateText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, textAlign: 'center' },
  emptyIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, borderBottomWidth: 1, gap: 10 },
  activityIcon: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityCopy: { flex: 1 },
  activityTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 3 },
  activityDetail: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  activityProject: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
  activityDate: { fontSize: 10, fontFamily: 'Inter_500Medium' },
});