import { TreeNodeComponent } from './TreeNode';
import { type TreeProps } from '@/types/treeStore.types';

// Handles an array of nodes and passes it to TreeNodeCompoent to be individually rendered
const Tree = ({ data }: TreeProps) => {
  return (
    <ul className="space-y-1.5">
      {data.map((node) => (
        <TreeNodeComponent key={node._id} node={node} />
      ))}
    </ul>
  );
};

export { Tree };
