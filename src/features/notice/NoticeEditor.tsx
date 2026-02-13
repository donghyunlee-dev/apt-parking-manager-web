import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface NoticeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const NoticeEditor = ({ value, onChange }: NoticeEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor: updated }) => {
      onChange(updated.getHTML());
    },
  });

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-3 py-2">
        <button
          type="button"
          className="rounded-md border border-slate-200 px-2 py-1 text-xs"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-200 px-2 py-1 text-xs"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-200 px-2 py-1 text-xs"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          List
        </button>
      </div>
      <EditorContent editor={editor} className="min-h-[160px] px-3 py-2 text-sm" />
    </div>
  );
};

export default NoticeEditor;
