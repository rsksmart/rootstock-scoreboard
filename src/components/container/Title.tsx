import React from 'react'

function Title() {
  return (
    <h1 className='text-7xl font-bold text-black gap-3 leading-tight flex flex-col'>
      <span className='flex gap-2'>
        <span className='bg-custom-orange'>ScoreBoard</span>
        <span className='bg-custom-green'>Rootstock</span>
      </span>
      <span className='flex gap-3 text-5xl'>
        <span className='bg-custom-pink'>AirDrop</span>
        <span className='bg-custom-lime'>Voting</span>
      </span>
    </h1>
  )
}

export default Title
