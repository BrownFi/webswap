interface PageContainerProps {
    children: React.ReactNode;
}

const PageContainer = ({ children }: PageContainerProps) => {
    // Match webswap's content width (header is max-w-[1280px] centered) so CLMM's
    // pool list / detail don't stretch edge-to-edge and stay aligned with the app.
    // Block (not flex) so children fill the bounded width instead of expanding to
    // content — flex items get min-width:auto, which let the pool table overflow
    // the viewport on mobile instead of scrolling within its own overflow-auto.
    return (
        <div className="block w-full max-w-[1280px] mx-auto px-2 sm:px-4 max-md:py-4 max-md:pb-24 py-10 animate-fade-in duration-200">
            {children}
        </div>
    );
};

export default PageContainer;
