export enum AppFeatureModule {
    SmartRouter = "SmartRouterModule",

    CustomPools = "CustomPoolsModule",
    Analytics = "AnalyticsModule",
    Farming = "FarmingModule",
    LimitOrders = "LimitOrdersModule",
    ALM = "ALMModule",

    VE_33 = "Ve33Module",

    BoostedPools = "BoostedPoolsModule",
}

/* configure enabled modules here.
 * Disabled modules are hidden from the navigation, their routes are not registered,
 * and their state-store branches are bypassed. Re-enable as contracts/subgraph
 * become available on Hemi. */
export const enabledModules: Record<AppFeatureModule, boolean> = {
    [AppFeatureModule.SmartRouter]: false,

    // entryPoint deployer is configured in deploys.json — leave on so users can pick the all-inclusive pool type
    [AppFeatureModule.CustomPools]: true,

    // subgraph (hemi-analytics / hemi-farmings) is live — enabled
    [AppFeatureModule.Analytics]: true,
    [AppFeatureModule.Farming]: true,

    // contracts not deployed on Hemi yet
    [AppFeatureModule.LimitOrders]: false,
    [AppFeatureModule.ALM]: false,
    [AppFeatureModule.VE_33]: false,

    // no boosted tokens on Hemi — keep off so routing uses the native (non-Omega) path
    [AppFeatureModule.BoostedPools]: false,
};
