import { ReactEditor } from 'slate-react';
import { Editor } from 'slate';
// :-/ https://github.com/ianstormtaylor/slate/issues/3725
declare module 'slate' {
  export interface CustomTypes {
    Element: { type: string; data: Record<string, unknown> };
    Text: { type: string; data: Record<string, unknown> };
    Editor: { type: string; data: Record<string, unknown> };
  }
}

const getCurrentData = (editor: ReactEditor) => {
  const [existingNodeWithData] = Editor.nodes(editor, {
    mode: 'all',
    match: (node) => {
      return Boolean(node.data);
    },
  });
  const existingData = existingNodeWithData
    ? existingNodeWithData[0]?.data
    : {};

  return existingData;
};

export default getCurrentData;
