import React from 'react'
import Link from 'next/link'
import { FaDownload } from "react-icons/fa6";
import { MdOutlineContentPasteSearch } from "react-icons/md";

const BottomNavbar = () => {
  return (
    <div className='h-[3vh] w-[90%] flex gap-6 justify-between items-center fixed bottom-0 p-8 bg-[#FFCF11] border-2 border-gray-300 rounded-[50px] mb-6 left-1/2 transform -translate-x-1/2'>
      <Link className="flex flex-col justify-center items-center" href="/search"><MdOutlineContentPasteSearch size={30} color='#000' /><span className='text-xs text-center font-bold text-black'>Cerca</span></Link>
      <Link className="flex flex-col justify-center items-center" href="/"><img src="/hom-icon.png" alt="home icon" width={80} className='-mt-16 bg-white p-2 rounded-full' /></Link>
      <Link className="flex flex-col justify-center items-center" href="/roms"><FaDownload size={30} color='#000'/><span className='text-xs text-black text-center font-bold'>Roms</span></Link>
  </div>
  )
}

export default BottomNavbar
