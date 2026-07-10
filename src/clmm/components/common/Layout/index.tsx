// In the webswap integration, CLMM shares webswap's header/footer (rendered by
// StaticScreen). This Layout only wraps the page content + toaster; CLMM's own
// Header/Footer/MobileNavigation are intentionally NOT rendered here.
import { Toaster } from "@clmm/components/ui/toaster";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col w-full">
            <main className="flex-1">{children}</main>
            <Toaster />
        </div>
    );
};

export default Layout;
