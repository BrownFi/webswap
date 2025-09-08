import React from 'react'
import telegramIcon from 'assets/svg/telegram.svg'
import logoWhite from 'assets/svg/logo_white.svg'
import mirrorIcon from 'assets/images/mirror.png'
import xIcon from 'assets/svg/x.svg'

const Footer = () => {
  return (
    <div className="px-4 md:px-20 lg:py-10 pb-[100px] flex items-center justify-between w-full flex-wrap gap-4">
      <div>
        <img src={logoWhite} alt="logo" className="lg:w-[199px] w-[120px] mb-[12px]" />
        <p className="text-[12px] font-medium text-white">
          © {new Date().getUTCFullYear()} BrownFi. All rights reserved.
        </p>
      </div>
      <div className="flex items-center gap-6 ml-auto">
        <a
          href="https://x.com/BrownFiAMM"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
        >
          <img src={xIcon} alt="ico" className="lg:w-[40px] w-8" />
        </a>
        <a
          href="https://t.me/+X13wPOv_ZtQ3M2U9"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
        >
          <img src={telegramIcon} alt="ico" className="lg:w-[40px] w-8" title="BrownFi Announcement" />
        </a>
        <a
          href="https://t.me/brownfiammcommunity"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
        >
          <img src={telegramIcon} alt="ico" className="lg:w-[40px] w-8" title="BrownFi Community" />
        </a>
        <a
          href="https://mirror.xyz/0x64f4Fbd29b0AE2C8e18E7940CF823df5CB639bBa"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
        >
          <img
            src={mirrorIcon}
            alt="ico"
            className="lg:w-[40px] w-8 rounded-full border-white/70 border"
            title="Mirror"
          />
        </a>
      </div>
    </div>
  )
}

export default Footer
