import { create } from "zustand";

type ModalType =
  | "createEvent"
  | "createTeam"
  | "inviteMember"
  | "joinUrl"
  | "manageMembers"
  | "teamMembersManagement"
  | "orgMemberManagement"
  | null;

interface ModalState {
  type: ModalType;
  isOpen: boolean;
  openModal: (type: Exclude<ModalType, null>) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  isOpen: false,
  openModal: (type) => set({ isOpen: true, type }),
  closeModal: () => set({ isOpen: false, type: null }),
}));
