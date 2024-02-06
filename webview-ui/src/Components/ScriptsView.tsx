import { PortScriptType } from '../utilities/types';

const ScriptsView = (props: { scripts: PortScriptType | PortScriptType[], port: string }) => {

  let scriptsArray: { "@_id": string, "@_output": string }[] = [];

  if (!Array.isArray(props.scripts)) {
    scriptsArray.push(props.scripts);
  } else {
    scriptsArray = props.scripts;
  }

  const scriptsView = scriptsArray.map((script, index) => (
    <ScriptView script={script} key={props.port + index} />
  ));

  return (
    <div className='flex flex-col ml-5 mb-5'>
      <h4 className='text-white font-bold'>Scripts</h4>
      <div className='overflow-auto h-40 bg-gray-800 m-2 border rounded-md border-gray-700 max-w-full scripts-scrollbar'>
        <div className='w-full'>
        {scriptsView}
        </div>
        
      </div>
    </div>
  );
};

const ScriptView = (props: { script: PortScriptType }) => {
  return (
    <div className='grid m-2'>
      <p className='text-gray-400'>{props.script['@_id']}: </p>
      <div className='overflow-x-auto scripts-scrollbar'>
        <p className='text-gray-300 ml-2 whitespace-nowrap'>{props.script['@_output']}</p>
      </div>
    </div>
  );
};


export default ScriptsView;