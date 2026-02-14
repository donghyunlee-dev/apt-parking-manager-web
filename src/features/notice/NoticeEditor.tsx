import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/shared/components/ui/Button';

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
    <div className="rounded-lg border border-input">
      <div className="flex flex-wrap gap-2 border-b border-border bg-muted/50 px-3 py-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Bold
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          Italic
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          List
        </Button>
      </div>
      <EditorContent editor={editor} className="min-h-[160px] px-3 py-2 text-sm" />
    </div>
  );
};

export default NoticeEditor;
