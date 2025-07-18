import React from 'react'

const Button = ({children , className='', disabled = false, ...props}) => {
  return (
    <button className={`bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 ${className}`}
    
    disabled={disabled}
    {...props}
    >
        {children}
    </button>
  )
}

export default Button