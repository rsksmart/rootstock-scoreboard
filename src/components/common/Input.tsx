import { classNames } from "@/utils/ClassNames"
import { ChangeEventHandler } from "react"

type props = {
  placeholder: string
  type?: string
  className?: string
  border?: boolean
  height?: number
  id?: string | undefined
  value: string | number | readonly string[] | undefined
  name: string
  onChange: ChangeEventHandler<HTMLInputElement> | undefined
}
function Input({
  placeholder,
  type = 'text',
  className,
  border = true,
  height = 36,
  id = undefined,
  value,
  onChange,
  name
  }: props
  ) {

  const baseStyles = 'bg-black flex-1 h-[36px] rounded-full px-3 w-full';
  const outlineStyles = border ? 'border' : '';

  return (
    <input
      name={name}
      value={value}
      style={{ height }}
      className={`${className} ${classNames(
        baseStyles,
        outlineStyles
      )}`}
      type={type}
      placeholder={placeholder}
      id={id}
      onChange={onChange}
    />
  )
}

export default Input
