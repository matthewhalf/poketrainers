"use client"
import BottomNavbar from '@/components/BottomNavbar';
import Header from '@/components/Header';
import SearchPokemon from '@/components/SearchPokemon';

const Home = () => {
  return (
    <div className='bg-[#FBFBFB]'>
      <Header />
      <SearchPokemon />
      <BottomNavbar />
    </div>
  );
};

export default Home;
