import React from 'react'

const Header = () => {
  return (
    <div className='w-full flex justify-center items-center p-2
     bg-[#FFCF11] fixed top-0 rounded-b-[50px] z-10 shadow-md'>
      <img src="/logo-pokemon.png" alt="logo" width={80} />
    </div>
  )
}

export default Header
