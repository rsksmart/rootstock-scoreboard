import React from 'react'

function ArrowRightIcon({ className = 'fill-white', fill = 'white' }: { className?: string, fill?: string }) {
  return (
    <svg className={className} width="17" height="15" viewBox="0 0 17 15" fill='none' xmlns="http://www.w3.org/2000/svg">
     <path d="M9.8125 0.9375L8.87406 1.85166L13.8484 6.84375H0.625V8.15625H13.8484L8.87406 13.126L9.8125 14.0625L16.375 7.5L9.8125 0.9375Z" />
    </svg>
  )
}

export default ArrowRightIcon
