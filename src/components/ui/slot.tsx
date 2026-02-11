import * as React from 'react'


export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  (props, forwardedRef) => {
    const { children, ...slotProps } = props

    if (!React.isValidElement(children)) {
      return null
    }

    return React.cloneElement(children, {
      ...mergeProps(slotProps, children.props),
      ref: forwardedRef
        ? composeRefs(forwardedRef, (children as any).ref)
        : (children as any).ref,
    })
  }
)

Slot.displayName = 'Slot'


function mergeProps(slotProps: any, childProps: any) {
  const overrideProps = { ...childProps }

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName]
    const childPropValue = childProps[propName]

    const isHandler = /^on[A-Z]/.test(propName)

    if (isHandler) {
      // Compose event handlers
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          childPropValue(...args)
          slotPropValue(...args)
        }
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue
      }
    } else if (propName === 'style') {
      // Merge styles
      overrideProps[propName] = { ...slotPropValue, ...childPropValue }
    } else if (propName === 'className') {
      // Merge classNames
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(' ')
    }
  }

  return { ...slotProps, ...overrideProps }
}

function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T>).current = node
      }
    })
  }
}
