import React from 'react'
import logoWhite from '../../assets/svg/logo_white.svg'
import mediumIcon from '../../assets/svg/medium.svg'
import xIcon from '../../assets/svg/x.svg'
import discordIcon from '../../assets/svg/discord.svg'

const Footer = () => {
  return (
    <div className="py-[40px] px-[108px] flex items-center justify-between w-full">
      <div>
        <img src={logoWhite} alt="logo" className="w-[199px] mb-[24px]" />
        <p className="text-[12px] font-medium text-white">© 2024 BrownFi. All rights reserved.</p>
      </div>
      <div className="flex items-center">
        <a className="ml-[40px] cursor-pointer">
          <img src={xIcon} alt="ico" className="w-[40px]" />
        </a>
        <a className="ml-[40px] cursor-pointer">
          <img src={mediumIcon} alt="ico" className="w-[40px]" />
        </a>
        <a className="ml-[40px] cursor-pointer">
          <img src={discordIcon} alt="ico" className="w-[40px]" />
        </a>
      </div>
    </div>
  )
}

export default Footer
