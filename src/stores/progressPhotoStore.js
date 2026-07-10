import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_VERSION = 1;

export const useProgressPhotoStore = create(
  persist(
    (set, get) => ({
      photos: [],

      addPhoto: (photo) =>
        set((state) => ({
          photos: [photo, ...state.photos],
        })),

      deletePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        })),

      replacePhoto: (id, newDataUrl) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, dataUrl: newDataUrl } : p
          ),
        })),

      updateCategory: (id, category) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, category } : p
          ),
        })),
    }),
    {
      name: "fitforce-progress-photos",
      version: STORAGE_VERSION,
      migrate: (persisted, version) => {
        if (version < STORAGE_VERSION) {
          return { photos: [] };
        }
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!Array.isArray(state.photos)) state.photos = [];
      },
      partialize: (state) => ({
        photos: state.photos.map((p) => ({
          ...p,
          dataUrl: p.dataUrl,
        })),
      }),
    }
  )
);
