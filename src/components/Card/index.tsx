import React from 'react'
import classNames from 'classnames'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
  padding?: string
  border?: string
  borderRadius?: string
  backgroundColor?: string
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ width, padding, border, borderRadius, backgroundColor, className, style, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames('w-full rounded-none p-2', className)}
        style={{
          width: width ?? undefined,
          padding: padding ?? undefined,
          border: border ?? undefined,
          borderRadius: borderRadius ?? undefined,
          backgroundColor: backgroundColor ?? undefined,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    )
  },
)
Card.displayName = 'Card'

export const LightCard = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <Card ref={ref} className={classNames('border border-bg1 bg-bg1', className)} {...props} />
})
LightCard.displayName = 'LightCard'

export const RemoveLiqudityCard = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <Card ref={ref} className={classNames('border-0 bg-[#131216]', className)} padding="16px 24px" {...props} />
})
RemoveLiqudityCard.displayName = 'RemoveLiqudityCard'

export const LightGreyCard = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <Card ref={ref} className={classNames('bg-bg2', className)} {...props} />
})
LightGreyCard.displayName = 'LightGreyCard'

export const GreyCard = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <Card ref={ref} className={classNames('bg-[#1d1c21]', className)} {...props} />
})
GreyCard.displayName = 'GreyCard'

export const OutlineCard = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <Card ref={ref} className={classNames('border border-bg3', className)} {...props} />
})
OutlineCard.displayName = 'OutlineCard'

export const YellowCard = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      className={classNames('bg-[rgba(243,132,30,0.05)] font-medium text-yellow2', className)}
      {...props}
    />
  )
})
YellowCard.displayName = 'YellowCard'

export const PinkCard = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      className={classNames('bg-[rgba(255,0,122,0.03)] font-medium text-primary1', className)}
      {...props}
    />
  )
})
PinkCard.displayName = 'PinkCard'

export const BlueCard = React.forwardRef<HTMLDivElement, CardProps>(({ children, className, ...rest }, ref) => {
  return (
    <Card
      ref={ref}
      className={classNames('w-fit rounded-none bg-[rgba(39,227,171,0.1)] text-primary1', className)}
      {...rest}
    >
      <span className="text-xs font-medium text-greenMain">{children}</span>
    </Card>
  )
})
BlueCard.displayName = 'BlueCard'
