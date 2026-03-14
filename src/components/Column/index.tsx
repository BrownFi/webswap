import React from 'react'
import classNames from 'classnames'

type ColumnProps = React.HTMLAttributes<HTMLDivElement>

const Column = React.forwardRef<HTMLDivElement, ColumnProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={classNames('flex flex-col justify-start', className)} {...props} />
})
Column.displayName = 'Column'

export const ColumnCenter = React.forwardRef<HTMLDivElement, ColumnProps>(({ className, ...props }, ref) => {
  return <Column ref={ref} className={classNames('w-full items-center', className)} {...props} />
})
ColumnCenter.displayName = 'ColumnCenter'

const GAP_MAP: Record<string, string> = {
  sm: '8px',
  md: '12px',
  lg: '24px',
}

interface AutoColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg' | string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
}

export const AutoColumn = React.forwardRef<HTMLDivElement, AutoColumnProps>(
  ({ gap, justify, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames('grid auto-rows-auto', className)}
        style={{
          gridRowGap: gap ? GAP_MAP[gap] ?? gap : undefined,
          justifyItems: justify ?? undefined,
          ...style,
        }}
        {...props}
      />
    )
  }
)
AutoColumn.displayName = 'AutoColumn'

export default Column
