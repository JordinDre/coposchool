import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    AlertCircle,
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Redo,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo,
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
}

export default function RichTextEditor({ label, value, onChange, error, disabled = false, placeholder = 'Escribe aquí...' }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            TextStyle,
            Color,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline hover:text-blue-800',
                },
            }),
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose-base min-h-[200px] max-w-none p-4 focus:outline-none',
                    'prose-headings:font-semibold',
                    'prose-p:my-2',
                    'prose-ul:my-2',
                    'prose-ol:my-2',
                    'prose-li:my-1',
                    disabled && 'cursor-not-allowed opacity-50',
                ),
                'data-placeholder': placeholder,
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <div
                className={cn(
                    'rounded-md border border-input bg-background ring-offset-background',
                    error && 'border-red-500',
                    disabled && 'cursor-not-allowed opacity-50',
                )}
            >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-input p-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        disabled={disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-muted')}
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editor.can().chain().focus().toggleStrike().run() || disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive('strike') && 'bg-muted')}
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        disabled={disabled}
                        className={cn('h-8 px-2 text-xs', editor.isActive('heading', { level: 1 }) && 'bg-muted')}
                    >
                        H1
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        disabled={disabled}
                        className={cn('h-8 px-2 text-xs', editor.isActive('heading', { level: 2 }) && 'bg-muted')}
                    >
                        H2
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        disabled={disabled}
                        className={cn('h-8 px-2 text-xs', editor.isActive('heading', { level: 3 }) && 'bg-muted')}
                    >
                        H3
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        disabled={disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'left' }) && 'bg-muted')}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        disabled={disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'center' }) && 'bg-muted')}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        disabled={disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'right' }) && 'bg-muted')}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        disabled={disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-muted')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        disabled={disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-muted')}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={setLink}
                        disabled={disabled}
                        className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-muted')}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run() || disabled}
                        className="h-8 w-8 p-0"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run() || disabled}
                        className="h-8 w-8 p-0"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
                {/* Editor Content */}
                <div className="max-h-[400px] min-h-[200px] overflow-y-auto">
                    <EditorContent editor={editor} />
                </div>
            </div>
            {error && (
                <p className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    );
}
