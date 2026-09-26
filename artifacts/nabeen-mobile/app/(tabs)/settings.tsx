import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { BrandMark, Pill, ScreenHeader, ScreenShell } from '@/components/NabeenUI';
import { useColors } from '@/hooks/useColors';
import { usePersonalization } from '@/context/personalization';

const SETTINGS_KEY = '@nabeen/settings';

export default function SettingsScreen() {
  const colors = useColors();
  const { profile, isRegular, focusLabel, progress, track } = usePersonalization();
  const [notifications, setNotifications] = useState(true);
  const [adaptiveHome, setAdaptiveHome] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((value) => {
      if (!value) return;
      try {
        const parsed = JSON.parse(value) as { notifications?: boolean; adaptiveHome?: boolean };
        if (typeof parsed.notifications === 'boolean') setNotifications(parsed.notifications);
        if (typeof parsed.adaptiveHome === 'boolean') setAdaptiveHome(parsed.adaptiveHome);
      } catch {
        // Keep the defaults when settings are unreadable.
      }
    });
  }, []);

  const save = (key: 'notifications' | 'adaptiveHome', value: boolean) => {
    const next = { notifications: key === 'notifications' ? value : notifications, adaptiveHome: key === 'adaptiveHome' ? value : adaptiveHome };
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => undefined);
  };

  return (
    <ScreenShell>
      <ScreenHeader eyebrow="Workspace preferences" title="Settings" detail="Make nabeen feel more like yours." />
      <View style={[styles.profileCard, { backgroundColor: colors.sidebar }]}>
        <View style={styles.profileTop}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.accent }]}><Text style={[styles.profileInitial, { color: colors.sidebar }]}>N</Text></View>
          <View style={styles.profileCopy}>
            <Text style={[styles.profileName, { color: colors.sidebarForeground }]}>Nabeen workspace</Text>
            <Text style={[styles.profileDetail, { color: colors.sidebarForeground }]}>{isRegular ? 'Regular builder' : 'New builder'} · {focusLabel}</Text>
          </View>
          <Pill text={`${Math.min(100, progress)}%`} tone="accent" />
        </View>
        <View style={[styles.profileProgress, { backgroundColor: colors.sidebarAccent }]}><View style={[styles.profileProgressFill, { backgroundColor: colors.success, width: `${Math.max(7, progress)}%` }]} /></View>
        <Text style={[styles.profileFootnote, { color: colors.sidebarForeground }]}>{profile.eventCount} actions remembered · nabeen adapts locally on this device</Text>
      </View>

      <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>PERSONALIZATION</Text>
      <SettingRow icon="radio" title="Adaptive home" detail="Put the things you use most within reach." value={adaptiveHome} onChange={(value) => { setAdaptiveHome(value); save('adaptiveHome', value); }} colors={colors} />
      <SettingRow icon="bell" title="Workspace updates" detail="Keep an eye on meaningful project changes." value={notifications} onChange={(value) => { setNotifications(value); save('notifications', value); }} colors={colors} />

      <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>ABOUT NABEEN</Text>
      <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <BrandMark size={40} />
        <View style={styles.aboutCopy}>
          <Text style={[styles.aboutTitle, { color: colors.foreground }]}>Built to get lighter with use.</Text>
          <Text style={[styles.aboutDetail, { color: colors.mutedForeground }]}>nabeen keeps the core Replit-style workflow close without carrying every possible surface.</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.version, { color: colors.mutedForeground }]}>nabeen mobile · 1.0</Text>
    </ScreenShell>
  );
}

function SettingRow({ icon, title, detail, value, onChange, colors }: { icon: keyof typeof Feather.glyphMap; title: string; detail: string; value: boolean; onChange: (value: boolean) => void; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: colors.cyanSoft }]}><Feather name={icon} size={17} color={colors.secondaryForeground} /></View>
      <View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.settingDetail, { color: colors.mutedForeground }]}>{detail}</Text></View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.muted, true: colors.success }} thumbColor={colors.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { borderRadius: 22, padding: 18, marginBottom: 26 },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  profileAvatar: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  profileCopy: { flex: 1 },
  profileName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  profileDetail: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 3, opacity: 0.72 },
  profileProgress: { height: 5, borderRadius: 99, marginTop: 18, overflow: 'hidden' },
  profileProgressFill: { height: '100%', borderRadius: 99 },
  profileFootnote: { fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 8, opacity: 0.64 },
  groupTitle: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.3, marginBottom: 10, marginTop: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 18, padding: 13, marginBottom: 9 },
  settingIcon: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1 },
  settingTitle: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  settingDetail: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16, marginTop: 2 },
  aboutCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 18, padding: 13 },
  aboutCopy: { flex: 1 },
  aboutTitle: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  aboutDetail: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16, marginTop: 3 },
  version: { fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'center', marginTop: 24 },
});