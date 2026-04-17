import React from 'react'
import classNames from 'classnames'

export const BodyWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames(
        'relative w-full max-w-[690px] bg-[#1E1915] rounded-[20px] sm:rounded-[32px] p-[16px] sm:p-[24px] border border-[#2F2823]',
        'shadow-[0px_0px_1px_rgba(0,0,0,0.01),0px_4px_8px_rgba(0,0,0,0.04),0px_16px_24px_rgba(0,0,0,0.04),0px_24px_24px_rgba(0,0,0,0.01)]',
        className,
      )}
      {...props}
    />
  ),
)
BodyWrapper.displayName = 'BodyWrapper'

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
