import React from 'react'

export const Cards = ({children,className=``}) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
    
    {children}
    </div>
  )
}

export function CardContent({children,className=``}) {
  return (
    <div className={`text-gray-700 ${className}`}>
      {children}
    </div>
  )
}