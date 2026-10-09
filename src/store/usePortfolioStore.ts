import { create } from 'zustand';
import { Activity, activities as frozenActivities } from '../data/activities';
import eventsData from '../data/activities_events.json';

const LOCAL_STORAGE_KEY = 'dr_witcha_activities_v3';

// รวมชุด frozen วิจัย (84 กิจกรรม) + ชุดที่ขูดใหม่จากหมวด events (id ขึ้นต้น evt-)
const initialActivities: Activity[] = (() => {
  const seen = new Set<string>();
  const merged: Activity[] = [];
  for (const act of [...frozenActivities, ...((eventsData as Activity[]) || [])]) {
    if (!act || seen.has(act.id)) continue;
    seen.add(act.id);
    merged.push(act);
  }
  return merged;
})();

// Load activities from localStorage if modified, otherwise load default initial data
const loadInitialActivities = (): Activity[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved activities from localStorage:', e);
  }
  return initialActivities;
};

interface PortfolioStore {
  activitiesList: Activity[];
  selectedActivity: Activity | null;
  isModalOpen: boolean;
  
  setSelectedActivity: (activity: Activity | null) => void;
  setModalOpen: (isOpen: boolean) => void;
  
  deleteImage: (activityId: string, imageIndex: number) => void;
  updateActivity: (updated: Activity) => void;
  deleteActivity: (activityId: string) => void;
  resetToDefault: () => void;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  activitiesList: loadInitialActivities(),
  selectedActivity: null,
  isModalOpen: false,

  setSelectedActivity: (activity) => set({ selectedActivity: activity }),
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  // Delete a specific photo from an activity
  deleteImage: (activityId, imageIndex) => {
    const currentList = get().activitiesList;
    const updatedList = currentList.map((act) => {
      if (act.id === activityId) {
        const newImages = act.images.filter((_, idx) => idx !== imageIndex);
        return { ...act, images: newImages };
      }
      return act;
    });

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {}

    const updatedSelected = updatedList.find((a) => a.id === activityId) || null;
    set({ activitiesList: updatedList, selectedActivity: updatedSelected });
  },

  // Update activity text details (Title, Where, Date, Year, Context, What, How)
  updateActivity: (updated) => {
    const currentList = get().activitiesList;
    const updatedList = currentList.map((act) => (act.id === updated.id ? updated : act));

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {}

    set({ activitiesList: updatedList, selectedActivity: updated });
  },

  // Delete an entire activity
  deleteActivity: (activityId) => {
    const currentList = get().activitiesList;
    const updatedList = currentList.filter((act) => act.id !== activityId);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {}

    set({ activitiesList: updatedList, selectedActivity: null, isModalOpen: false });
  },

  // Reset to original data
  resetToDefault: () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    set({ activitiesList: initialActivities, selectedActivity: null, isModalOpen: false });
  },
}));
