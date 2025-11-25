import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import clsx from 'clsx'
import type { Note } from '../services/firebase'

interface EditorProps {
    note: Note
    onSave: (content: string) => void
}

export default function Editor({ note, onSave }: EditorProps) {
    const [content, setContent] = useState(note.content || '')
    const [mode, setMode] = useState<'edit' | 'preview'>('edit')
    const [isSaving, setIsSaving] = useState(false)

    // Update local state when note changes (e.g. selected different note)
    useEffect(() => {
        setContent(note.content || '')
    }, [note.id]) // Only reset when ID changes, not when content updates from server to avoid cursor jumps if we were to sync real-time

    // Debounced save
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (content !== (note.content || '')) {
                setIsSaving(true)
                onSave(content)
                setTimeout(() => setIsSaving(false), 1000)
            }
        }, 1000)

        return () => clearTimeout(timeoutId)
    }, [content, note.content, onSave])

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-white/10 p-4 flex items-center justify-between bg-surface/30 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <h2 className="font-semibold text-white text-lg truncate max-w-md">{note.title}</h2>
                    <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('edit')}
                            className={clsx(
                                'px-3 py-1 rounded text-sm font-medium transition-colors',
                                mode === 'edit' ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                            )}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setMode('preview')}
                            className={clsx(
                                'px-3 py-1 rounded text-sm font-medium transition-colors',
                                mode === 'preview' ? 'bg-primary text-background' : 'text-gray-400 hover:text-white'
                            )}
                        >
                            Preview
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isSaving ? (
                        <span className="text-xs text-primary animate-pulse">Saving...</span>
                    ) : (
                        <span className="text-xs text-gray-500">Saved</span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {mode === 'edit' ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full bg-transparent p-8 resize-none focus:outline-none text-gray-200 font-mono leading-relaxed"
                        placeholder="Start typing your note here..."
                    />
                ) : (
                    <div className="h-full overflow-y-auto p-8 prose prose-invert prose-primary max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    )
}
