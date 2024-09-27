import React from 'react'

function TableLoader() {
  return (
    <div className="animate-pulse w-full">
      <table className='w-full mt-5'>
        <thead>
          <tr className='w-full flex'>
            <th className='h-14 flex-1 bg-zinc-900 mb-6 rounded'></th>
            <th className='h-14 flex-1 bg-zinc-900 mb-6 rounded'></th>
            <th className='h-14 flex-1 bg-zinc-900 mb-6 rounded'></th>
            <th className='h-14 flex-1 bg-zinc-900 mb-6 rounded'></th>
            <th className='h-14 flex-1 bg-zinc-900 mb-6 rounded'></th>
            <th className='h-14 flex-1 bg-zinc-900 mb-6 rounded'></th>
          </tr>
        </thead>
        <tbody>
          {
            [1,2,3].map((e) => (
              <tr key={e} className='h-14 flex border-b-[1px] border-zinc-800 text-sm text-center'>
                <td className='h-4 flex-1 bg-zinc-900 mb-6 rounded'></td>
                <td className='h-4 flex-1 bg-zinc-900 mb-6 rounded'></td>
                <td className='h-4 flex-1 bg-zinc-900 mb-6 rounded'></td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default TableLoader
