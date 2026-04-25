import { TreeNodeComponent } from './TreeNode';
import { useData } from '@/store/useDataStore';
import { type TreeProps } from '@/types/tree.types';

// TODO: eliminate prop drilling. Just pass the zustand tree data here
// Handles an array of nodes and passes it to TreeNodeCompoent to be individually rendered
const Tree = ({ data }: TreeProps) => {
  return (
    <div>
      <ul className="space-y-1.5">
        {data.map((node) => (
          <TreeNodeComponent key={node._id} node={node} />
        ))}
      </ul>
    </div>
  );
};

export { Tree };
