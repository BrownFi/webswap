import { X } from "lucide-react";
import {
    Credenza,
    CredenzaBody,
    CredenzaClose,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "@clmm/components/ui/credenza";
import { LimitOrdersList } from "../LimitOrdersList";

interface LimitOrdersModalProps {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    children: React.ReactNode;
}

// My Limit Orders — the opened/closed order history lives in a modal (opened via
// the "Orders" button on the limit-order swap card) instead of an inline section
// below the card. Credenza = responsive (mobile drawer / desktop dialog).
export const LimitOrdersModal = ({ isOpen, setIsOpen, children }: LimitOrdersModalProps) => {
    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>{children}</CredenzaTrigger>
            <CredenzaContent
                className="bg-card-dark !rounded-xl sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl"
                onInteractOutside={() => setIsOpen(false)}
                onEscapeKeyDown={() => setIsOpen(false)}
            >
                <CredenzaHeader>
                    <CredenzaTitle>My Limit Orders</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaBody>
                    <LimitOrdersList />
                </CredenzaBody>
                <CredenzaClose asChild>
                    <button type="button" className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
                        <X size={18} />
                    </button>
                </CredenzaClose>
            </CredenzaContent>
        </Credenza>
    );
};
