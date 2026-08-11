import PageContainer from "@clmm/components/common/PageContainer";
import PageTitle from "@clmm/components/common/PageTitle";
import PoolsList from "@clmm/components/pools/PoolsList";
import PoolStatsBar from "@clmm/components/pools/PoolStatsBar";
import SecurityStatusTag from "@clmm/components/pools/SecurityStatusTag";
import { Button } from "@clmm/components/ui/button";
import { DEFAULT_CHAIN_ID } from "@clmm/config";
import { useReadSecurityRegistryGlobalStatus } from "@clmm/generated";
import { SecurityState } from "@clmm/hooks/pools/usePool";
import { useSecurityRegistryConfigured } from "@clmm/hooks/pools/useSecurityRegistryConfigured";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PoolsPage = () => {
    const hasSecurityRegistry = useSecurityRegistryConfigured();
    const { data: rawGlobalStatus } = useReadSecurityRegistryGlobalStatus({
        chainId: DEFAULT_CHAIN_ID,
        query: { enabled: hasSecurityRegistry },
    });

    /* No registry deployed = open factory; allow pool creation freely. */
    const globalStatus = hasSecurityRegistry ? rawGlobalStatus : SecurityState.ENABLED;
    const enableActions = globalStatus === SecurityState.ENABLED;

    return (
        <PageContainer>
            <div className="w-full flex justify-between items-center mb-6">
                <PageTitle title={"Liquidity Pools"} showSettings={false} />
                <div className="flex items-center gap-2">
                    <SecurityStatusTag status={globalStatus} />
                    {enableActions && (
                        <Link to={"create"}>
                            <Button variant={"primary"} size={"md"} className="whitespace-nowrap rounded-lg gap-2">
                                <Plus size={20} />
                                Create a Pool
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="w-full mb-6">
                <PoolStatsBar />
            </div>

            <div className="w-full">
                <div className="pb-4 bg-card-dark border border-card-border rounded-xl">
                    <PoolsList />
                </div>
            </div>
        </PageContainer>
    );
};

export default PoolsPage;
