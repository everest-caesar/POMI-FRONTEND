import * as React from 'react';
import { type ThemeProviderProps as NextThemesProviderProps } from 'next-themes';
type ThemeProviderProps = NextThemesProviderProps & {
    children: React.ReactNode;
};
export declare function ThemeProvider({ children, ...props }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=theme-provider.d.ts.map