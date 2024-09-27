import React from 'react'

type props = {
  color: 'orange' | 'green' | 'pink' | 'lime' | 'cyan',
  title: string,
  isNew?: boolean
}
function Badge({ color, title, isNew }: props) {
  const typeColor = {
    orange: 'bg-custom-orange',
    green: 'bg-custom-green',
    pink: 'bg-custom-pink',
    lime: 'bg-custom-lime',
    cyan: 'bg-custom-cyan !text-white',

  }
  return (
    <span className={` ${typeColor[color]} ${isNew ? 'absolute -left-4 top-3 -rotate-45' : ''} text-black text-xs rounded-full flex justify-center items-center px-2 py-1 font-semibold`}>
      { title }
    </span>
  )
}

export default Badge
