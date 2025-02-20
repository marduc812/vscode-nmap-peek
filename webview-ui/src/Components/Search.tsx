import React, { useState } from 'react';
import { VscSearch, VscInfo } from "react-icons/vsc";

interface SearchProps {
  onSearch: (query: string) => void;
}

const Search = ({ onSearch }: SearchProps) => {

  const [visible, setVisible] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  };

  const toggleVisible = () => {
    setVisible(prevVisible => !prevVisible);
  };

  return (
    <div className='flex flex-col'>
      <div className='flex w-full items-center'>
        <div className='w-full flex flex-row m-2 p-2 rounded-lg bg-gray-600 text-white items-center'>
          <VscSearch />
          <input
            onChange={handleInputChange}
            placeholder='Search hosts'
            className='bg-gray-600 ml-2 w-full focus:outline-none' />
        </div>
        <div>
          <VscInfo className='fill-gray-500 text-2xl ml-1 mr-5 hover:fill-white cursor-pointer' onClick={toggleVisible} />
        </div>
      </div>
      
      
      {visible && <div className='flex flex-col w-full'>
        <h2 className='text-xl text-gray-300 text-center'>Search Filters</h2>
        <div className='m-2 p-2 ml-5 text-gray-400 flex flex-col items-center'>
          <div>
            <p>The default search is matching for strings in every part of the nmap scan</p>
            <p>By using the <span className='bg-gray-800 text-green-500 px-1 rounded border border-green-700'>filter:search term</span> it filters on the service section.</p>
            <p>When you have a filter enabled, you can export only those services filtered.</p> 
            <p>Now the <span className='bg-gray-800 text-green-500 px-1 rounded border border-green-700'>pnumber</span> filter, shows only the matching port.</p>
          </div>

          <table className='m-5 text-left'>
            <thead>
              <tr>
                <th>Filter</th>
                <th>Fields</th>
                <th className='pl-2'>Match</th>
              </tr>
            </thead>
            <tbody>
            <tr>
                <td><span className='bg-gray-800 text-green-500 px-1 rounded border border-green-700'>host</span></td>
                <td className='pl-2'>IP and Hostname: <span className='text-gray-500'>ex. 1.1.1.1 test.hostname</span></td>
                <td className='pl-2'>Partial</td>
              </tr>
              <tr>
                <td><span className='bg-gray-800 text-green-500 px-1 rounded border border-green-700'>status</span></td>
                <td className='pl-2'>Host Status: <span className='text-gray-500'>up or down</span></td>
                <td className='pl-2'>Exact</td>
              </tr>
              <tr>
                <td><span className='bg-gray-800 text-green-500 px-1 rounded border border-green-700'>state</span></td>
                <td className='pl-2'>Port status: <span className='text-gray-500'>ex. open, closed, filtered.</span> </td>
                <td className='pl-2'>Partial</td>
              </tr>
              <tr>
                <td><span className='bg-gray-800 text-green-500 px-1 rounded border border-green-700'>pnumber</span></td>
                <td className='pl-2'>Port number: <span className='text-gray-500'>ex. 22, 445.</span> </td>
                <td className='pl-2'>Exact</td>
              </tr>
              <tr>
                <td><span className='bg-gray-800 text-green-500 px-1 rounded border border-green-700'>sname</span></td>
                <td className='pl-2'>Service Name: <span className='text-gray-500'>ex. http, smtp, rdp.</span> </td>
                <td className='pl-2'>Partial</td>
              </tr>
              <tr>
                <td><span className='bg-gray-800 text-green-500 px-1 rounded border border-green-700'>port</span></td>
                <td className='pl-2'>Everything about ports: <span className='text-gray-500'>ex. rpcbind, PostgreSQL DB, v3.2</span></td>
                <td className='pl-2'>Partial</td>
              </tr>
              <tr>
                <td><span className='bg-gray-800 text-green-500 px-1 rounded border border-green-700'>script</span></td>
                <td className='pl-2'>Script output information: <span className='text-gray-500'>ex. Supported Methods, Apache</span></td>
                <td className='pl-2'>Partial</td>
              </tr>
              
            </tbody>
          </table>

        </div>
      </div>}
    </div>
  );
};

export default Search;
