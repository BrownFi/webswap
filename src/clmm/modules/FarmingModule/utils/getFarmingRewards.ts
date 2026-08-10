import { simulateFarmingCenterCollectRewards } from "@clmm/generated";
import { wagmiConfig } from "@clmm/providers/WagmiProvider";
import { Address } from "viem";

export async function getFarmingRewards({
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
    tokenId,
}: {
    rewardToken: Address;
    bonusRewardToken: Address;
    pool: Address;
    nonce: bigint;
    tokenId: bigint;
}): Promise<{ reward: bigint; bonusReward: bigint }> {
    try {
        const {
            result: [reward, bonusReward],
        } = await simulateFarmingCenterCollectRewards(wagmiConfig, {
            args: [
                {
                    rewardToken,
                    bonusRewardToken,
                    pool,
                    nonce,
                },
                tokenId,
            ],
        });

        return {
            reward,
            bonusReward,
        };
    } catch (e) {
        console.error(e);
        return {
            reward: 0n,
            bonusReward: 0n,
        };
    }
}
