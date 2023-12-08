import React from 'react';
import { VscSearch } from "react-icons/vsc";

interface SearchProps {
  onSearch: (query: string) => void;
}

const Search = ({ onSearch }: SearchProps) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  };

  return (
    <div className='flex w-full'>
      <div className='w-full flex flex-row m-2 p-2 rounded-lg bg-gray-600 text-white items-center'>
        <VscSearch />
        <input
          onChange={handleInputChange}
          placeholder='Search hosts'
          className='bg-gray-600 ml-2 w-full focus:outline-none' />
      </div>
    </div>
  );
};

export default Search;
