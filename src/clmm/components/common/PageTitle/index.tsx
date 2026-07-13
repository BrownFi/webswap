import Settings from "../Settings";

interface PageTitleProps {
    title?: string;
    showSettings?: boolean;
    children?: React.ReactNode;
}

/* Matches BrownFi webswap's "Liquidity Pools" title:
 * Inter 600, 24px → 36px responsive, tight -0.02em tracking, off-white. */
const PageTitle = ({ title, children, showSettings = true }: PageTitleProps) => {
    return (
        <div className="flex w-full items-center justify-between whitespace-nowrap">
            <div className="flex items-center gap-4 w-full">
                {title && (
                    <h1
                        className="text-2xl sm:text-[36px] leading-tight sm:leading-[44px] text-text-100"
                        style={{ fontFamily: "Inter", fontWeight: 600, letterSpacing: "-0.02em" }}
                    >
                        {title}
                    </h1>
                )}
                {children && children}
            </div>
            {showSettings && <Settings />}
        </div>
    );
};

export default PageTitle;
