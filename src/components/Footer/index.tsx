import React from 'react'

import mirrorIcon from 'assets/images/mirror.png'
import logoWhite from 'assets/svg/logo_white.svg'
import telegramIcon from 'assets/svg/telegram.svg'
import xIcon from 'assets/svg/x.svg'

const Footer = () => {
  return (
    <div className="py-[40px] px-[108px] flex items-center justify-between w-full">
      <div>
        <img src={logoWhite} alt="logo" className="w-[199px] mb-[24px]" />
        <p className="text-[12px] font-medium text-white">© 2024 BrownFi. All rights reserved.</p>
      </div>
      <div className="flex items-center gap-6">
        <a
          href="https://x.com/BrownFidex"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
        >
          <img src={xIcon} alt="ico" className="w-[40px]" />
        </a>
        <a
          href="https://t.me/+X13wPOv_ZtQ3M2U9"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
        >
          <img src={telegramIcon} alt="ico" className="w-[40px]" title="BrownFi Announcement" />
        </a>
        <a
          href="https://t.me/brownfiammcommunity"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
        >
          <img src={telegramIcon} alt="ico" className="w-[40px]" title="BrownFi Community" />
        </a>
        <a
          href="https://mirror.xyz/0x64f4Fbd29b0AE2C8e18E7940CF823df5CB639bBa"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
        >
          <img src={mirrorIcon} alt="ico" className="w-[40px] rounded-full border-white/70 border" title="Mirror" />
        </a>
      </div>
    </div>
  )
}

export default Footer
