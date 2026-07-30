import { create } from "zustand";

export type SwapRoutePreference = "auto" | "brownfi" | "nordstern";

interface RoutePreferenceState {
    // "auto" = best-of (pick higher output). "brownfi"/"nordstern" = user forced it.
    preferredRoute: SwapRoutePreference;
    setPreferredRoute: (r: SwapRoutePreference) => void;
}

export const useSwapRoutePreference = create<RoutePreferenceState>((set) => ({
    preferredRoute: "auto",
    setPreferredRoute: (preferredRoute) => set({ preferredRoute }),
}));
