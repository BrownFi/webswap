import React from 'react'

import { useActiveWeb3React } from 'hooks'
import { useVersion } from 'hooks/useVersion'

type Props = {
  isMobile?: boolean
}

const SwitchVersion = ({ isMobile }: Props) => {
  const { chainId } = useActiveWeb3React()
  const { appVersion: version, isDisabled, switchVersion } = useVersion({ chainId })

  const isOn = version === 2

  const handleToggle = () => {
    if (isDisabled) return
    switchVersion(isOn ? 1 : 2)
    setTimeout(() => {
      location.reload()
    }, 200)
  }

  if (isDisabled) return null

  return (
    <div
      onClick={handleToggle}
      className={
        `relative w-16 h-8 rounded-full transition-colors duration-300 ease-in-out flex items-center justify-between px-2.5` +
        ` ${isOn ? 'bg-[#773030]' : 'bg-[#77303088]'}` +
        ` ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}` +
        ` ${isMobile ? 'md:hidden' : 'max-md:hidden'}`
      }
    >
      {/* Labels inside the switch track */}
      <span className="text-xs font-bold text-white select-none">{'V2'}</span>
      <span className="text-xs font-bold text-white select-none">{'V1'}</span>

      {/* Thumb that slides over the labels */}
      <div
        className={
          `absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out` +
          ` ${isOn ? 'translate-x-8' : ''}` +
          ` ${isDisabled ? 'bg-gray-300' : 'bg-white'}`
        }
      ></div>
    </div>
  )
}

export default SwitchVersion
