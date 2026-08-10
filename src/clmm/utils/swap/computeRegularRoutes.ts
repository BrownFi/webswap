import { Currency, Pool, Route, Token } from "@cryptoalgebra/integral-sdk";

// Hemi liquidity is a linear chain of 5 tokens (WETH-USDC.e-VUSD-hemiBTC-WBTC), so
// some pairs (e.g. ETH<->WBTC) need up to 4 hops. The pool set is small, so a DFS
// up to this depth is cheap; raise/lower as liquidity topology changes.
const MAX_HOPS = 4;

/**
 * Computes regular (non-boosted) routes between input and output currencies by a
 * depth-first search over the candidate pools, up to `maxHops` hops. Each pool is
 * used at most once per route. Replaces the previous hard-coded 1-hop/2-hop version
 * that could never find 3-4 hop chains through intermediate tokens.
 */
export function computeRegularRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    maxHops: number = MAX_HOPS
): Route<Currency, Currency>[] {
    const tokenIn = currencyIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    const routes: Route<Currency, Currency>[] = [];

    const used = new Array(pools.length).fill(false);

    const walk = (currentToken: Token, path: Pool[]) => {
        // Reached the output through `path` — record it and don't route past the target.
        if (path.length > 0 && currentToken.equals(tokenOut)) {
            try {
                routes.push(new Route([...path], currencyIn, currencyOut));
            } catch (e) {
                // Skip invalid routes
            }
            return;
        }

        if (path.length >= maxHops) return;

        for (let i = 0; i < pools.length; i++) {
            if (used[i]) continue;
            const pool = pools[i];

            const involvesCurrent = pool.token0.equals(currentToken) || pool.token1.equals(currentToken);
            if (!involvesCurrent) continue;

            const nextToken = pool.token0.equals(currentToken) ? pool.token1 : pool.token0;

            used[i] = true;
            walk(nextToken, [...path, pool]);
            used[i] = false;
        }
    };

    walk(tokenIn, []);

    return routes;
}
