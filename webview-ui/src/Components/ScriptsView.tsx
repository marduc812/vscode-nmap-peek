import React from 'react';
import { PortScriptType } from '../utilities/types';

const ScriptsView = (props: { scripts: PortScriptType | PortScriptType[], port: string}) => {

    let scriptsArray : {"@_id": string, "@_output": string}[] = [];

    if (!Array.isArray(props.scripts)) {
        scriptsArray.push(props.scripts);
    } else {
        scriptsArray = props.scripts;
    }

    const scriptsView = scriptsArray.map((script, index) => (
      <ScriptView script={script} key={props.port + index}/>
    ));


  return (
    <div className='flex flex-col ml-5 mb-5'>
      <h4 className='text-white font-bold'>Scripts</h4>
      <div className='overflow-auto h-40 scripts-scrollbar bg-gray-800 m-2 border rounded-md border-gray-700'>
        {scriptsView}
      </div>
    </div>
  );
};

export default ScriptsView;


const ScriptView = (props: {script: PortScriptType}) => {

  return(
    <div className='flex flex-row ml-2'>
      <p className='text-gray-400'>{props.script['@_id']}: </p>
      <p className='text-gray-300 ml-2'>{props.script['@_output']}</p>
    </div>
  );
};