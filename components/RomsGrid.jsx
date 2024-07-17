"use client"
import { Roms } from "@/data"


const RomsGrid = () => {
  return (
    <div className='fixed top-[13vh] left-1/2 transform -translate-x-1/2 w-[80%] pb-[20vh]'>
        <h1 className='text-center text-slate-800 font-extrabold text-4xl mt-2'>Downloads</h1>
        <div className="grid grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto">
      {Roms.map((rom, index) => (
        <div className="mt-12 flex flex-col justify-center items-center text-center" key={index} >
            <img src={rom.img} alt={rom.title} width={150}/>
            <p className="text-black text-sm font-bold">{rom.title}</p>
            <a href={rom.link} className="text-[#0075BE] font-bold">Scarica ora</a>
        </div>
      ))}
      </div>
    </div>
  )
}

export default RomsGrid
