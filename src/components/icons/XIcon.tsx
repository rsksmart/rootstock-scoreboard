import React from 'react'

function XIcon({ className = 'stroke-black' }: { className?: string }) {
  return (
    <svg className={className} width="11" height="11" viewBox="0 0 11 11" fill='none' xmlns="http://www.w3.org/2000/svg">
      <path d="M1.24264 9.74264L9.72792 1.25736L1.24264 9.74264ZM1.24264 1.25736L9.72792 9.74264L1.24264 1.25736Z" />
      <path d="M1.24264 9.74264L9.72792 1.25736M1.24264 1.25736L9.72792 9.74264" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default XIcon
