"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { FaUsers, FaBox } from 'react-icons/fa';
import { IoSearchOutline } from 'react-icons/io5';

import MetaStats from '@/components/MetaStats';
import MetaTeams from '@/components/MetaTeams';
import BoxBuilder from '@/components/BoxBuilder';

export default function Home() {
  const [activeTab, setActiveTab] = useState('meta');
  const [format, setFormat] = useState('gen9vgc2026regi');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Premium Poke Trainers Yellow Header */}
      <header className="bg-[#FFCF11] border-b-4 border-[#0075BE] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 bg-white p-1 rounded-2xl shadow-inner border border-yellow-400 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo-pokemon.png"
                alt="Poke Trainers Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 drop-shadow-sm">
                <span className="text-[#0075BE]">Poke</span> Trainers
              </h1>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest -mt-1 opacity-80">
                Pokémon Champions Companion
              </p>
            </div>
          </div>


        </div>
      </header>

      {/* Tabs Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[92px] sm:top-[92px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between sm:justify-start gap-1 sm:gap-6 overflow-x-auto py-2.5">
            <button
              onClick={() => setActiveTab('meta')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                activeTab === 'meta'
                  ? 'bg-[#0075BE]/10 text-[#0075BE] border border-[#0075BE]/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <IoSearchOutline className="text-lg" />
              Meta Analisi
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                activeTab === 'teams'
                  ? 'bg-[#0075BE]/10 text-[#0075BE] border border-[#0075BE]/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <FaUsers className="text-lg" />
              Team Consigliati
            </button>
            <button
              onClick={() => setActiveTab('box')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                activeTab === 'box'
                  ? 'bg-[#0075BE]/10 text-[#0075BE] border border-[#0075BE]/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <FaBox className="text-lg" />
              Crea Team da Box
            </button>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 min-h-[600px]">
          {activeTab === 'meta' && <MetaStats />}
          {activeTab === 'teams' && <MetaTeams format={format} setFormat={setFormat} />}
          {activeTab === 'box' && <BoxBuilder format={format} setFormat={setFormat} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          <p>© {new Date().getFullYear()} Poke Trainers. Tutti i marchi e i copyright dei Pokémon sono di proprietà di Nintendo e Game Freak.</p>
          <p className="mt-1.5 opacity-60">Sviluppato per Pokémon Champions Mobile.</p>
        </div>
      </footer>
    </div>
  );
}
