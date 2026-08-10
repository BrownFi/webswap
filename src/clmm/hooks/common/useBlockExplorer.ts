import { useAppKitNetwork } from "@reown/appkit/react";

export function useBlockExplorerURL(): string {
    const { caipNetwork: chain } = useAppKitNetwork();

    return chain?.blockExplorers?.default.url || "https://etherscan.io/";
}
