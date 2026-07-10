import { Toaster } from "@clmm/components/ui/toaster";
import Header from "../Header";
import Footer from "../Footer";
import { MobileNavigation } from "../Navigation";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col min-h-full w-full">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
            <MobileNavigation />
        </div>
    );
};

export default Layout;
