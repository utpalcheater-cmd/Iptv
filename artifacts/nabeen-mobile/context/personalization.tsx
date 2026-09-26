import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type EventName =
  | 'app_open'
  | 'view_dashboard'
  | 'open_project'
  | 'create_project'
  | 'view_activity'
  | 'view_capabilities'
  | 'open_settings'
  | 'open_workspace';

type Focus = 'build' | 'review' | 'ship';

type BehaviorProfile = {
  sessions: number;
  eventCount: number;
  events: Partial<Record<EventName, number>>;
  lastSeenAt: string;
};

type PersonalizationValue = {
  profile: BehaviorProfile;
  isRegular: boolean;
  focus: Focus;
  focusLabel: string;
  progress: number;
  track: (event: EventName) => void;
};

const STORAGE_KEY = '@nabeen/behavior-profile';
const defaultProfile: BehaviorProfile = {
  sessions: 0,
  eventCount: 0,
  events: {},
  lastSeenAt: '',
};

const PersonalizationContext = createContext<PersonalizationValue | null>(null);

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BehaviorProfile>(defaultProfile);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (!active || !value) return;
      try {
        setProfile({ ...defaultProfile, ...JSON.parse(value) } as BehaviorProfile);
      } catch {
        setProfile(defaultProfile);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const track = useCallback((event: EventName) => {
    setProfile((current) => {
      const next: BehaviorProfile = {
        sessions: current.sessions + (event === 'app_open' ? 1 : 0),
        eventCount: current.eventCount + 1,
        events: {
          ...current.events,
          [event]: (current.events[event] ?? 0) + 1,
        },
        lastSeenAt: new Date().toISOString(),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  useEffect(() => {
    track('app_open');
  }, []);

  const value = useMemo<PersonalizationValue>(() => {
    const buildScore = (profile.events.open_project ?? 0) + (profile.events.create_project ?? 0) + (profile.events.open_workspace ?? 0);
    const reviewScore = (profile.events.view_activity ?? 0) + (profile.events.view_dashboard ?? 0);
    const shipScore = (profile.events.view_capabilities ?? 0) + (profile.events.open_workspace ?? 0);
    const focus: Focus = buildScore >= reviewScore && buildScore >= shipScore
      ? 'build'
      : reviewScore >= shipScore
        ? 'review'
        : 'ship';
    const focusLabel = focus === 'build' ? 'Build mode' : focus === 'review' ? 'Review mode' : 'Ship mode';
    const score = Math.min(100, profile.sessions * 12 + profile.eventCount * 5);

    return {
      profile,
      isRegular: score >= 60,
      focus,
      focusLabel,
      progress: score,
      track,
    };
  }, [profile, track]);

  return <PersonalizationContext.Provider value={value}>{children}</PersonalizationContext.Provider>;
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) throw new Error('usePersonalization must be used inside PersonalizationProvider');
  return context;
}