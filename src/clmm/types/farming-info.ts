import { EternalFarming, SinglePoolQuery } from "@clmm/graphql/generated/graphql";
import { Token } from "@cryptoalgebra/integral-sdk";

export interface Farming {
    farming: EternalFarming;
    rewardToken: Token;
    bonusRewardToken: Token | null;
    pool: SinglePoolQuery["pool"];
}
