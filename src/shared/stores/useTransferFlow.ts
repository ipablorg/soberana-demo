import { create } from 'zustand';

export interface TransferPreviewData {
  fromId: string;
  toId: string;
  amount: number;
  fee: number;
  eta: string;
  railLabel: string;
}

interface TransferFlowState {
  isPreviewOpen: boolean;
  previewData: TransferPreviewData | null;
  openPreview: (data: TransferPreviewData) => void;
  closePreview: () => void;
}

export const useTransferFlow = create<TransferFlowState>((set) => ({
  isPreviewOpen: false,
  previewData: null,
  openPreview: (data) => set({ isPreviewOpen: true, previewData: data }),
  closePreview: () => set({ isPreviewOpen: false }),
}));


