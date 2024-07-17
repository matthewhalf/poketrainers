import React from 'react'
import Link from 'next/link'

const BottomNavbar = () => {
  return (
    <div className='h-[5vh] w-full flex gap-6 justify-between items-center fixed bottom-0 p-10 bg-[#FFCF11] rounded-t-[50px]'>
      <Link href="#"><img src="/search-gen.svg" alt="search-icon" width={30}/></Link>
      <Link href="#"><img src="/hom-icon.png" alt="home icon" width={80} className='-mt-16 bg-white p-2 rounded-full' /></Link>
      <Link href="#"><img src="/rom-download.svg" alt="" /></Link>
    </div>
  )
}

export default BottomNavbar
