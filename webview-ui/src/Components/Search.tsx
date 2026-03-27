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
      <div className='flex w-full items-center px-3 pt-1'>
        <div className='w-full flex flex-row items-center bg-[#252836] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 focus-within:border-indigo-500/50 transition-colors duration-200'>
          <VscSearch className='text-slate-400 flex-shrink-0' />
          <input
            onChange={handleInputChange}
            placeholder='Search hosts...'
            className='bg-transparent ml-2 w-full focus:outline-none text-slate-200 placeholder-slate-500 text-sm' />
        </div>
        <div>
          <VscInfo className='text-slate-500 text-xl ml-2 mr-2 hover:text-indigo-400 cursor-pointer transition-colors duration-200' onClick={toggleVisible} />
        </div>
      </div>

      {visible && (
        <div className='mx-3 mt-2 bg-[#1a1d27] border border-[rgba(255,255,255,0.06)] rounded-lg p-4'>
          <h2 className='text-sm font-semibold text-slate-300 mb-3'>Search Filters</h2>
          <div className='text-slate-400 text-xs space-y-1 mb-4'>
            <p>Default search matches strings across all fields.</p>
            <p>Use <FilterBadge>filter:term</FilterBadge> to narrow results to specific fields.</p>
            <p>The <FilterBadge>pnumber</FilterBadge> filter shows only the matching port.</p>
          </div>

          <table className='w-full text-left text-xs'>
            <thead>
              <tr className='border-b border-[rgba(255,255,255,0.06)]'>
                <th className='pb-2 text-slate-500 font-medium'>Filter</th>
                <th className='pb-2 text-slate-500 font-medium pl-3'>Fields</th>
                <th className='pb-2 text-slate-500 font-medium pl-3'>Match</th>
              </tr>
            </thead>
            <tbody className='text-slate-300'>
              <FilterRow filter="host" desc="IP and Hostname" example="1.1.1.1, test.hostname" match="Partial" />
              <FilterRow filter="status" desc="Host Status" example="up or down" match="Exact" />
              <FilterRow filter="state" desc="Port status" example="open, closed, filtered" match="Partial" />
              <FilterRow filter="pnumber" desc="Port number" example="22, 445" match="Exact" />
              <FilterRow filter="sname" desc="Service Name" example="http, smtp, rdp" match="Partial" />
              <FilterRow filter="port" desc="Everything about ports" example="rpcbind, PostgreSQL" match="Partial" />
              <FilterRow filter="script" desc="Script output" example="Supported Methods" match="Partial" />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const FilterBadge = (props: { children: React.ReactNode }) => (
  <span className='bg-[#252836] text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono border border-emerald-500/20'>
    {props.children}
  </span>
);

const FilterRow = (props: { filter: string; desc: string; example: string; match: string }) => (
  <tr className='border-b border-[rgba(255,255,255,0.03)]'>
    <td className='py-1.5'><FilterBadge>{props.filter}</FilterBadge></td>
    <td className='py-1.5 pl-3'>{props.desc} <span className='text-slate-500'>{props.example}</span></td>
    <td className='py-1.5 pl-3 text-slate-400'>{props.match}</td>
  </tr>
);

export default Search;
