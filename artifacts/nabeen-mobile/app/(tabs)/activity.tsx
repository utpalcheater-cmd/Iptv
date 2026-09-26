import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { getListActivityQueryKey, useListActivity } from '@workspace/api-client-react';
import { ActivityRow, ErrorState, LoadingState, ScreenHeader, ScreenShell } from '@/components/NabeenUI';
import { usePersonalization } from '@/context/personalization';

export default function ActivityScreen() {
  const router = useRouter();
  const activity = useListActivity({ limit: 50 }, { query: { queryKey: getListActivityQueryKey({ limit: 50 }), staleTime: 20_000 } });
  const { track } = usePersonalization();

  if (activity.isLoading) return <ScreenShell scroll={false}><LoadingState label="Gathering your activity" /></ScreenShell>;
  if (activity.isError) return <ScreenShell scroll={false}><ErrorState onRetry={() => activity.refetch()} /></ScreenShell>;

  useEffect(() => {
    track('view_activity');
  }, [track]);
  return (
    <ScreenShell>
      <ScreenHeader eyebrow="Workspace memory" title="Activity" detail="A quiet timeline of what is moving in your workspace." />
      {activity.data?.map((item) => <ActivityRow key={item.id} {...item} />)}
    </ScreenShell>
  );
}