import { NavLink } from "react-router-dom";
import BrownFiLogoWhite from "@clmm/assets/brownfi-logo-white.svg";

const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TelegramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

// Blog → Paragraph: the official Paragraph brand mark. Source:
// https://paragraph.com/brand (ivory variant, recoloured to currentColor).
const ParagraphIcon = () => (
    <svg width="24" height="24" viewBox="0 0 81 82" fill="none">
        <path d="M6 0V76.1345H81" stroke="currentColor" strokeWidth="10.6585" strokeMiterlimit="10" />
        <path d="M34.4067 5.30176L6 76.1337L76.0722 46.9673" stroke="currentColor" strokeWidth="10.6585" strokeLinejoin="round" />
        <path d="M6 76.129L59.0302 21.5845" stroke="currentColor" strokeWidth="10.6585" strokeMiterlimit="10" />
    </svg>
);

// Docs → GitBook: the official GitBook brand mark (filled, matching the X /
// Telegram icons' fill style). Source: simpleicons.org "GitBook".
const DocsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.802 17.77a.703.703 0 1 1-.002 1.406.703.703 0 0 1 .002-1.406m11.024-4.347a.703.703 0 1 1 .001-1.406.703.703 0 0 1-.001 1.406m0-2.876a2.176 2.176 0 0 0-2.174 2.174c0 .233.039.465.115.691l-7.181 3.823a2.165 2.165 0 0 0-1.784-.937c-.829 0-1.589.475-1.95 1.216l-6.451-3.402c-.682-.358-1.192-1.48-1.138-2.502.028-.533.212-.947.493-1.107.178-.1.392-.092.62.027l.042.023c1.71.9 7.304 3.847 7.54 3.956.363.169.565.237 1.185-.057l11.564-6.014c.17-.064.368-.227.368-.474 0-.342-.354-.477-.355-.477-.658-.315-1.669-.788-2.655-1.25-2.108-.987-4.497-2.105-5.546-2.655-.906-.474-1.635-.074-1.765.006l-.252.125C7.78 6.048 1.46 9.178 1.1 9.394.457 9.78.058 10.575.006 11.628c-.08 1.67.779 3.41 1.952 3.96l6.86 3.516a2.17 2.17 0 0 0 2.043 1.446 2.176 2.176 0 0 0 2.174-2.174c0-.124-.013-.247-.032-.367l7.317-3.844c.378.337.872.523 1.378.523A2.176 2.176 0 0 0 24 12.519a2.176 2.176 0 0 0-2.174-2.072" />
    </svg>
);

// All links are icons (per webswap UX — text + icons read messy).
// Blog = the Paragraph brand mark; Docs = the GitBook glyph.
const socials = [
    { icon: <XIcon />, href: "https://x.com/BrownFiAMM", label: "X" },
    { icon: <TelegramIcon />, href: "https://t.me/brownfiammcommunity", label: "Telegram" },
    { icon: <ParagraphIcon />, href: "https://paragraph.com/@brownfi-amm", label: "Blog" },
    { icon: <DocsIcon />, href: "https://brownfi.gitbook.io/brownfi-docs", label: "Docs" },
];

const Footer = () => (
    <footer className="w-full mt-12 px-4 pt-12 pb-8 flex flex-col items-center gap-5">
        <div className="w-full max-w-[1760px] flex justify-between items-start gap-5 flex-wrap">
            <NavLink to={"/"} className="inline-block">
                <img src={BrownFiLogoWhite} alt="BrownFi" className="w-[132px] h-8" />
            </NavLink>

            <div className="flex gap-3 items-center flex-wrap mx-auto md:mx-0 justify-center md:justify-start">
                {socials.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-text-100 hover:opacity-70 transition-opacity"
                    >
                        {item.icon}
                    </a>
                ))}
            </div>
        </div>

        <div className="w-full max-w-[1760px] flex flex-col gap-6">
            <div className="w-full h-px bg-card-border" />
            <span className="text-base text-text-200 text-center" style={{ fontFamily: "Geist, Inter, sans-serif" }}>
                &copy;{new Date().getUTCFullYear()} BrownFi. All rights reserved.
            </span>
        </div>
    </footer>
);

export default Footer;
