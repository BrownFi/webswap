import React from 'react'
import classNames from 'classnames'

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
  align?: string
  justify?: string
  padding?: string
  border?: string
  borderRadius?: string
  gap?: string
}

const Row = React.forwardRef<HTMLDivElement, RowProps>(
  ({ width, align, justify, padding, border, borderRadius, gap, className, style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames('flex w-full items-center', className)}
        style={{
          width: width ?? undefined,
          alignItems: align ?? undefined,
          justifyContent: justify ?? undefined,
          padding: padding ?? undefined,
          border: border ?? undefined,
          borderRadius: borderRadius ?? undefined,
          margin: gap ? `-${gap}` : undefined,
          ...style,
        }}
        {...rest}
      />
    )
  }
)
Row.displayName = 'Row'

export const RowBetween = React.forwardRef<HTMLDivElement, RowProps>(({ className, ...props }, ref) => {
  return <Row ref={ref} className={classNames('justify-between', className)} {...props} />
})
RowBetween.displayName = 'RowBetween'

export const RowFlat = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={classNames('flex items-center', className)} {...props} />
  }
)
RowFlat.displayName = 'RowFlat'

export const AutoRow = React.forwardRef<HTMLDivElement, RowProps>(
  ({ gap, className, style, children, ...props }, ref) => {
    return (
      <Row
        ref={ref}
        className={classNames('flex-wrap', className)}
        style={{
          margin: gap ? `-${gap}` : undefined,
          ...style,
        }}
        {...props}
      >
        {gap
          ? React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<any>, {
                    style: { margin: gap, ...(child.props as any).style },
                  })
                : child
            )
          : children}
      </Row>
    )
  }
)
AutoRow.displayName = 'AutoRow'

export const RowFixed = React.forwardRef<HTMLDivElement, RowProps>(({ gap, className, style, ...props }, ref) => {
  return (
    <Row
      ref={ref}
      className={classNames('!w-fit', className)}
      style={{
        margin: gap ? `-${gap}` : undefined,
        ...style,
      }}
      {...props}
    />
  )
})
RowFixed.displayName = 'RowFixed'

export default Row
