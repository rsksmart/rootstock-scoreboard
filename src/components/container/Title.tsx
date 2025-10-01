import React from 'react'

function Title() {
  return (
    <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black gap-2 sm:gap-3 leading-tight flex flex-col'>
      <span className='flex gap-1.5 sm:gap-2 flex-wrap'>
        <span className='bg-custom-orange px-1 sm:px-2'>ScoreBoard</span>
        <span className='bg-custom-green px-1 sm:px-2'>Rootstock</span>
      </span>
      <span className='flex gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl flex-wrap'>
        <span className='bg-custom-pink px-1 sm:px-2'>AirDrop</span>
        <span className='bg-custom-lime px-1 sm:px-2'>Voting</span>
      </span>
    </h1>
  )
}

export default Title
