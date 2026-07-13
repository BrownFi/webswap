// In the webswap integration, CLMM shares webswap's header/footer (rendered by
// StaticScreen). This Layout only wraps the page content + toaster; CLMM's own
// Header/Footer/MobileNavigation are intentionally NOT rendered here.
import { Toaster } from "@clmm/components/ui/toaster";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    // min-width:0 lets these flex/grid items shrink to the viewport instead of
    // expanding to wide content (tables), so the page doesn't overflow on mobile.
    return (
        <div className="flex flex-col w-full" style={{ minWidth: 0 }}>
            <main className="flex-1" style={{ minWidth: 0 }}>
                {children}
            </main>
            <Toaster />
        </div>
    );
};

export default Layout;
