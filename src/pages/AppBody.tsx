import React from 'react'
import classNames from 'classnames'

export const BodyWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames(
        'relative w-full max-w-[500px] bg-[rgba(26,21,16,0.85)] rounded-[20px] pb-6 border border-[rgba(196,148,58,0.25)] backdrop-blur-md',
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
