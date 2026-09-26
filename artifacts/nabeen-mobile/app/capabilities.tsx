import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getGetCapabilitiesQueryKey, useGetCapabilities } from '@workspace/api-client-react';
import { ErrorState, LoadingState, ScreenHeader, ScreenShell } from '@/components/NabeenUI';
import { useColors } from '@/hooks/useColors';
import { usePersonalization } from '@/context/personalization';

export default function CapabilitiesScreen() {
  const colors = useColors();
  const router = useRouter();
  const capabilities = useGetCapabilities({ query: { queryKey: getGetCapabilitiesQueryKey(), staleTime: 60_000 } });
  const { track } = usePersonalization();

  if (capabilities.isLoading) return <ScreenShell scroll={false}><LoadingState label="Mapping nabeen" /></ScreenShell>;
  if (capabilities.isError) return <ScreenShell scroll={false}><ErrorState onRetry={() => capabilities.refetch()} /></ScreenShell>;

  useEffect(() => {
    track('view_capabilities');
  }, [track]);
  return (
    <ScreenShell>
      <ScreenHeader eyebrow="Nabeen map" title="Capabilities" detail="A focused view of what is ready now and what can grow next." right={<View style={[styles.closeButton, { backgroundColor: colors.card, borderColor: colors.border }]}><Feather onPress={() => router.back()} name="x" size={18} color={colors.foreground} /></View>} />
      {capabilities.data?.map((capability) => (
        <View key={capability.id} style={[styles.capabilityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.capabilityIcon, { backgroundColor: capability.status === 'available' ? colors.cyanSoft : colors.amberSoft }]}>
            <Feather name={capability.status === 'available' ? 'check' : 'clock'} size={17} color={capability.status === 'available' ? colors.secondaryForeground : colors.accentForeground} />
          </View>
          <View style={styles.capabilityCopy}>
            <View style={styles.capabilityTitleRow}><Text style={[styles.capabilityTitle, { color: colors.foreground }]}>{capability.label}</Text><Text style={[styles.capabilityStatus, { color: capability.status === 'available' ? colors.success : colors.accentForeground }]}>{capability.status === 'available' ? 'Ready' : 'Next'}</Text></View>
            <Text style={[styles.capabilityDetail, { color: colors.mutedForeground }]}>{capability.description}</Text>
            <Text style={[styles.category, { color: colors.primary }]}>{capability.category}</Text>
          </View>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  closeButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  capabilityCard: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10 },
  capabilityIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  capabilityCopy: { flex: 1 },
  capabilityTitleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  capabilityTitle: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  capabilityStatus: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
  capabilityDetail: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, marginTop: 5 },
  category: { fontSize: 10, fontFamily: 'Inter_600SemiBold', marginTop: 8 },
});