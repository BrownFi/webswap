import App from "@clmm/App";
import PoolsList from "@clmm/components/pools/PoolsList";
import Page404 from "@clmm/pages/Page404";
import { SwapPageView } from "@clmm/pages/Swap/types";
import { enabledModules } from "@clmm/config/app-modules";
import { ComponentType, lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider as _RouterProvider, RouteObject } from "react-router-dom";

import AnalyticsModule from "@clmm/modules/AnalyticsModule";
const { AnalyticsPoolPage, TransactionsList, TokensList, AnalyticsTokenPage } = AnalyticsModule.components;

/* When a new deploy ships, currently-open tabs still reference the previous
 * chunk hashes. Navigating triggers React.lazy, which 404s on the old hash and
 * throws "Failed to fetch dynamically imported module". Catch that, flip a
 * sessionStorage flag, and hard-reload so the browser picks up the new
 * index.html with current chunk references. The flag prevents an infinite
 * reload loop if the failure is actually permanent. */
const RELOAD_KEY = "__chunk_reload_attempt";

function lazyWithReload<T extends ComponentType<unknown>>(factory: () => Promise<{ default: T }>) {
    return lazy<T>(async () => {
        try {
            const mod = await factory();
            sessionStorage.removeItem(RELOAD_KEY);
            return mod;
        } catch (err) {
            const msg = String(err);
            const looksStale = /failed to fetch dynamically imported module|importing a module script failed/i.test(msg);
            const alreadyTried = sessionStorage.getItem(RELOAD_KEY) === "1";
            if (looksStale && !alreadyTried) {
                sessionStorage.setItem(RELOAD_KEY, "1");
                window.location.reload();
                return new Promise<{ default: T }>(() => {});
            }
            throw err;
        }
    });
}

const SwapPage = lazyWithReload(() => import("@clmm/pages/Swap"));
const PoolsPage = lazyWithReload(() => import("@clmm/pages/Pools"));
const PoolPage = lazyWithReload(() => import("@clmm/pages/Pool"));
const CreatePoolPage = lazyWithReload(() => import("@clmm/pages/CreatePool"));
const NewPositionPage = lazyWithReload(() => import("@clmm/pages/NewPosition"));
const AnalyticsPage = lazyWithReload(() => import("@clmm/pages/Analytics"));
const VeTOKENPage = lazyWithReload(() => import("@clmm/pages/VeTOKEN"));
const VotePage = lazyWithReload(() => import("@clmm/pages/Vote"));

const withSuspense = (node: React.ReactNode) => <Suspense fallback={null}>{node}</Suspense>;

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate replace to="/clamm/swap" />,
        errorElement: <Page404 />,
    },
    {
        element: <App />,
        children: [
            {
                path: "swap",
                element: withSuspense(<SwapPage type={SwapPageView.SWAP} />),
            },
            enabledModules.LimitOrdersModule && {
                path: "limit-order",
                element: withSuspense(<SwapPage type={SwapPageView.LIMIT_ORDER} />),
            },
            {
                // Pool list is /clamm/pool (singular) to match the oracle-based side's /pool.
                path: "pool",
                element: withSuspense(<PoolsPage />),
            },
            {
                path: "pool/create",
                element: withSuspense(<CreatePoolPage />),
            },
            {
                path: "pool/:pool",
                element: withSuspense(<PoolPage />),
            },
            {
                path: "pool/:pool/new-position",
                element: withSuspense(<NewPositionPage />),
            },

            ...(enabledModules.AnalyticsModule
                ? [
                      {
                          path: "/analytics",
                          element: withSuspense(
                              <AnalyticsPage>
                                  <PoolsList isExplore />
                              </AnalyticsPage>
                          ),
                      },
                      {
                          path: "/analytics/tokens",
                          element: withSuspense(
                              <AnalyticsPage>
                                  <TokensList />
                              </AnalyticsPage>
                          ),
                      },
                      {
                          path: "/analytics/transactions",
                          element: withSuspense(
                              <AnalyticsPage>
                                  <TransactionsList />
                              </AnalyticsPage>
                          ),
                      },
                      {
                          path: "/analytics/tokens/:tokenId",
                          element: withSuspense(<AnalyticsTokenPage />),
                      },
                      {
                          path: "/analytics/pools/:poolId",
                          element: withSuspense(<AnalyticsPoolPage />),
                      },
                  ]
                : []),

            ...(enabledModules.Ve33Module
                ? [
                      {
                          path: "vetoken",
                          element: withSuspense(<VeTOKENPage />),
                      },
                      {
                          path: "vote",
                          element: withSuspense(<VotePage />),
                      },
                  ]
                : []),
        ].filter(Boolean) as RouteObject[],
    },
]);

export default function RouterProvider() {
    return <_RouterProvider router={router} />;
}
