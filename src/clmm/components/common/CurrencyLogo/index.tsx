import { Currency } from "@cryptoalgebra/integral-sdk";
import React from "react";
import { NATIVE_LOGO, TOKEN_LOGOS } from "@clmm/config/tokens";
import { cn } from "@clmm/utils/common/cn";
import { Skeleton } from "@clmm/components/ui/skeleton";
import { Address } from "viem";

interface CurrencyLogoProps {
    currency: Currency | undefined | null;
    size: number;
    className?: string;
    style?: React.CSSProperties;
}

const CurrencyLogo = ({ currency, size, className, style = {} }: CurrencyLogoProps) => {
    if (!currency)
        return (
            <Skeleton
                className={cn(`flex rounded-full bg-white/5 border border-card-border animate-none`, className)}
                style={{ minWidth: `${size}px`, minHeight: `${size}px`, width: `${size}px`, height: `${size}px`, ...style }}
            />
        );

    const classString = cn(`w-[${size}px] h-[${size}px] min-w-[${size}px] min-h-[${size}px] bg-card-dark rounded-full`, className);

    if (currency.isNative) {
        const nativeLogo = NATIVE_LOGO[currency.chainId];
        if (nativeLogo) {
            return <img src={nativeLogo} alt={currency.symbol ?? ""} width={size} height={size} className={classString} style={style} />;
        }
    } else {
        const address = currency.wrapped.address.toLowerCase() as Address;
        const logo = TOKEN_LOGOS[address];
        if (logo) {
            return <img src={logo} alt={currency.symbol ?? ""} width={size} height={size} className={classString} style={style} />;
        }
    }

    return (
        <div
            className={`${classString} flex items-center justify-center bg-white text-black`}
            style={{ minWidth: `${size}px`, minHeight: `${size}px`, width: `${size}px`, height: `${size}px`, ...style }}
        >
            {currency.symbol?.slice(0, 2)}
        </div>
    );
};

export default CurrencyLogo;
