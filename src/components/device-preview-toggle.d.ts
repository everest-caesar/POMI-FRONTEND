import { type ReactNode } from "react";
type DeviceMode = "desktop" | "mobile";
export declare const useDeviceMode: () => {
    deviceMode: DeviceMode;
    setDeviceMode: (mode: DeviceMode) => void;
};
export declare function DevicePreviewToggle({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=device-preview-toggle.d.ts.map