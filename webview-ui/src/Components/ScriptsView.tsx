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
    <div className='my-2 ml-4'>
      <h4 className='text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5'>Scripts</h4>
      <div className='overflow-auto max-h-48 bg-[#0f1117] rounded-md border border-[rgba(255,255,255,0.06)] scripts-scrollbar'>
        {scriptsView}
      </div>
    </div>
  );
};

const ScriptView = (props: { script: PortScriptType }) => {

  const scriptLines = props.script['@_output'].split("&#xa;");

  return (
    <div className='p-2 border-b border-[rgba(255,255,255,0.03)] last:border-b-0'>
      <p className='text-indigo-300 text-xs font-semibold font-mono mb-0.5'>{props.script['@_id']}</p>
      <div className='overflow-x-auto scripts-scrollbar'>
        {scriptLines.map((line, index) => (
          <p key={index} className="text-slate-400 text-xs font-mono ml-2 leading-relaxed">{line}</p>
        ))}
      </div>
    </div>
  );
};


export default ScriptsView;
