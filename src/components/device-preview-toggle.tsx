"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import { Monitor, Smartphone } from "lucide-react"

type DeviceMode = "desktop" | "mobile"

const DeviceContext = createContext<{
  deviceMode: DeviceMode
  setDeviceMode: (mode: DeviceMode) => void
}>({
  deviceMode: "desktop",
  setDeviceMode: () => {},
})

export const useDeviceMode = () => useContext(DeviceContext)

export function DevicePreviewToggle({ children }: { children: ReactNode }) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop")

  return (
    <DeviceContext.Provider value={{ deviceMode, setDeviceMode }}>
      {/* Floating toggle button */}
      <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-1 rounded-full bg-slate-800 p-1 shadow-lg border border-slate-700">
        <button
          onClick={() => setDeviceMode("desktop")}
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all ${
            deviceMode === "desktop" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          aria-label="Desktop view"
        >
          <Monitor className="h-4 w-4" />
          <span className="hidden sm:inline">Desktop</span>
        </button>
        <button
          onClick={() => setDeviceMode("mobile")}
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all ${
            deviceMode === "mobile" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          aria-label="Mobile view"
        >
          <Smartphone className="h-4 w-4" />
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>

      {/* Content wrapper with device simulation */}
      {deviceMode === "desktop" ? (
        <div className="min-h-screen">{children}</div>
      ) : (
        <div className="min-h-screen bg-slate-950 flex items-start justify-center py-6 px-3 sm:px-4">
          <div className="relative w-full max-w-[420px] rounded-[1.75rem] border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-2 bg-slate-900/90 backdrop-blur-sm text-xs text-slate-400">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  <div className="w-1 h-2 bg-slate-400 rounded-sm" />
                  <div className="w-1 h-2.5 bg-slate-400 rounded-sm" />
                  <div className="w-1 h-3 bg-slate-400 rounded-sm" />
                  <div className="w-1 h-3.5 bg-slate-500 rounded-sm" />
                </div>
                <span className="ml-1">5G</span>
                <div className="w-6 h-3 border border-slate-400 rounded-sm ml-1 relative">
                  <div className="absolute inset-0.5 right-1 bg-green-500 rounded-sm" />
                  <div className="absolute -right-0.5 top-1 w-0.5 h-1 bg-slate-400 rounded-r-sm" />
                </div>
              </div>
            </div>

            <div className="h-[720px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              <div className="px-3 pb-4">{children}</div>
            </div>

            <div className="sticky bottom-0 z-20 flex justify-center py-2 bg-slate-900/90 backdrop-blur-sm">
              <div className="w-28 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </DeviceContext.Provider>
  )
}
