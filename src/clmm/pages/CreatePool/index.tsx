import PageContainer from "@clmm/components/common/PageContainer";
import PageTitle from "@clmm/components/common/PageTitle";
import CreatePoolForm from "@clmm/components/create-pool/CreatePoolForm";
import { ChevronLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

const CreatePoolPage = () => {
    return (
        <PageContainer>
            <div className="w-full max-w-md mx-auto flex items-center gap-2 mb-6">
                <NavLink className="flex items-center gap-2 text-text-200 hover:text-text-100" to={"/clmm/pools"}>
                    <ChevronLeft size={24} />
                </NavLink>
                <PageTitle title={"Create Pool"} showSettings={false} />
            </div>
            <div className="w-full max-w-md mx-auto">
                <CreatePoolForm />
            </div>
        </PageContainer>
    );
};

export default CreatePoolPage;
