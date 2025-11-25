import { useState, useEffect } from 'react'
import NotesSidebar from '../components/NotesSidebar'
import Editor from '../components/Editor'
import { useAuth } from '../context/AuthContext'
import { FirestoreService, type Note } from '../services/firebase'

export default function Notes() {
    const { user } = useAuth()
    const [notes, setNotes] = useState<Note[]>([])
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return
        const unsubscribe = FirestoreService.subscribeToUserNotes(user.uid, setNotes)
        return () => unsubscribe()
    }, [user])

    const handleCreateFolder = async (parentId: string | null = null) => {
        if (!user) return
        const title = prompt('Folder Name:')
        if (!title) return
        await FirestoreService.addDocument('notes', {
            userId: user.uid,
            title,
            type: 'folder',
            parentId,
            content: ''
        })
    }

    const handleCreateNote = async (parentId: string | null = null) => {
        if (!user) return
        const title = prompt('Note Name:')
        if (!title) return
        const docRef = await FirestoreService.addDocument('notes', {
            userId: user.uid,
            title,
            type: 'note',
            parentId,
            content: ''
        })
        setSelectedNoteId(docRef.id)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await FirestoreService.deleteDocument('notes', id)
            if (selectedNoteId === id) setSelectedNoteId(null)
        }
    }

    const handleSaveNote = async (id: string, content: string) => {
        await FirestoreService.updateDocument('notes', id, { content })
    }

    const handleMove = async (noteId: string, newParentId: string | null) => {
        await FirestoreService.updateDocument('notes', noteId, { parentId: newParentId })
    }

    const handleRename = async (noteId: string, newTitle: string) => {
        await FirestoreService.updateDocument('notes', noteId, { title: newTitle })
    }

    const selectedNote = notes.find(n => n.id === selectedNoteId)

    return (
        <div className="h-[calc(100vh-4rem)] -m-8 p-8">
            <div className="flex h-full bg-surface/50 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
                <NotesSidebar 
                    notes={notes}
                    selectedNoteId={selectedNoteId}
                    onSelect={setSelectedNoteId}
                    onCreateFolder={handleCreateFolder}
                    onCreateNote={handleCreateNote}
                    onDelete={handleDelete}
                    onMove={handleMove}
                    onRename={handleRename}
                />
                <div className="flex-1 bg-background/50 relative">
                    {selectedNote ? (
                        <Editor 
                            key={selectedNote.id}
                            note={selectedNote}
                            onSave={(content) => handleSaveNote(selectedNote.id, content)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <p className="text-lg font-medium text-gray-400">No note selected</p>
                                <p className="text-sm text-gray-600">Select a note from the sidebar to start editing</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
