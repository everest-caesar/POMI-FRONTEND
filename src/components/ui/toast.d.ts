import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
declare const ToastProvider: React.FC<ToastPrimitives.ToastProviderProps>;
declare const ToastViewport: React.ForwardRefExoticComponent<any>;
declare const Toast: React.ForwardRefExoticComponent<any>;
declare const ToastAction: React.ForwardRefExoticComponent<any>;
declare const ToastClose: React.ForwardRefExoticComponent<any>;
declare const ToastTitle: React.ForwardRefExoticComponent<any>;
declare const ToastDescription: React.ForwardRefExoticComponent<any>;
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;
export { type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction, };
//# sourceMappingURL=toast.d.ts.map