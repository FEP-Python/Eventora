import { create } from 'zustand';

type OrgModalType = "create" | "edit" | "delete" | null;

interface OrgModalState {
    isOpen: boolean;
    type: OrgModalType;
    onOpen: (type: OrgModalType) => void;
    onClose: () => void;
}

export const useOrgModal = create<OrgModalState>((set) => ({
    isOpen: false,
    type: null,
    onOpen: (type) => set({ isOpen: true, type }),
    onClose: () => set({ isOpen: false, type: null }),
}));
