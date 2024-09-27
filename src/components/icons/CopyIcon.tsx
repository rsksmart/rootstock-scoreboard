import React from 'react'

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_763_6384)">
        <path d="M10.6668 0.666626H2.66683C1.9335 0.666626 1.3335 1.26663 1.3335 1.99996V11.3333H2.66683V1.99996H10.6668V0.666626ZM12.6668 3.33329H5.3335C4.60016 3.33329 4.00016 3.93329 4.00016 4.66663V14C4.00016 14.7333 4.60016 15.3333 5.3335 15.3333H12.6668C13.4002 15.3333 14.0002 14.7333 14.0002 14V4.66663C14.0002 3.93329 13.4002 3.33329 12.6668 3.33329ZM12.6668 14H5.3335V4.66663H12.6668V14Z"/>
      </g>
      <defs>
        <clipPath id="clip0_763_6384">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
}

export default CopyIcon
