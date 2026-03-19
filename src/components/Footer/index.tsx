import telegramIcon from 'assets/svg/telegram.svg'
import telegramChatIcon from 'assets/svg/telegram-chat.svg'
import logoWhite from 'assets/svg/logo_white.svg'
import mirrorIcon from 'assets/svg/mirror.svg'
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
          aria-label="BrownFi on X"
        >
          <img src={xIcon} alt="X" className="lg:w-[40px] w-8" />
        </a>
        <a
          href="https://t.me/+X13wPOv_ZtQ3M2U9"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
          aria-label="BrownFi Announcement on Telegram"
          title="Announcement"
        >
          <img src={telegramIcon} alt="Telegram Announcement" className="lg:w-[40px] w-8" />
        </a>
        <a
          href="https://t.me/brownfiammcommunity"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
          aria-label="BrownFi Community on Telegram"
          title="Community Chat"
        >
          <img src={telegramChatIcon} alt="Telegram Community" className="lg:w-[40px] w-8" />
        </a>
        <a
          href="https://mirror.xyz/0x64f4Fbd29b0AE2C8e18E7940CF823df5CB639bBa"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:brightness-90"
          aria-label="BrownFi on Mirror"
        >
          <img
            src={mirrorIcon}
            alt="Mirror"
            className="lg:w-[40px] w-8"
            title="Mirror"
          />
        </a>
      </div>
    </div>
  )
}

export default Footer
