import { Folder, FileText, ChevronRight, ChevronDown, Brain, Trash2, FilePlus, FolderPlus, Edit2 } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import type { Note } from '../services/firebase'

interface NotesSidebarProps {
    notes: Note[]
    selectedNoteId: string | null
    onSelect: (id: string) => void
    onCreateFolder: (parentId: string | null) => void
    onCreateNote: (parentId: string | null) => void
    onDelete: (id: string) => void
    onMove: (noteId: string, newParentId: string | null) => void
    onRename: (noteId: string, newTitle: string) => void
}

export default function NotesSidebar({ 
    notes, 
    selectedNoteId, 
    onSelect, 
    onCreateFolder, 
    onCreateNote, 
    onDelete,
    onMove,
    onRename
}: NotesSidebarProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [dragOverId, setDragOverId] = useState<string | null>(null)

    const toggleFolder = (id: string) => {
        const newExpanded = new Set(expandedFolders)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedFolders(newExpanded)
    }

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent, id: string | null, isFolder: boolean) => {
        e.preventDefault()
        e.stopPropagation()
        if (isFolder || id === null) {
            setDragOverId(id)
            e.dataTransfer.dropEffect = 'move'
        }
    }

    const handleDrop = (e: React.DragEvent, targetId: string | null) => {
        e.preventDefault()
        e.stopPropagation()
        setDragOverId(null)
        const draggedId = e.dataTransfer.getData('text/plain')
        
        if (draggedId === targetId) return
        
        // Prevent dropping a folder into its own child (cycle detection)
        // Simple check: if target is a child of dragged folder (recursively)
        // For now, just basic check: don't drop on self.
        // A more robust check would be needed for deep nesting cycles.
        
        onMove(draggedId, targetId)
    }

    const handleRenameClick = (note: Note) => {
        const newTitle = prompt('Rename to:', note.title)
        if (newTitle && newTitle !== note.title) {
            onRename(note.id, newTitle)
        }
    }

    const renderNode = (node: Note, depth = 0) => {
        const isFolder = node.type === 'folder'
        const isExpanded = expandedFolders.has(node.id)
        const isSelected = selectedNoteId === node.id
        const children = notes.filter(n => n.parentId === node.id)
        const isDragOver = dragOverId === node.id

        return (
            <div key={node.id}>
                <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.id)}
                    onDragOver={(e) => handleDragOver(e, node.id, isFolder)}
                    onDrop={(e) => handleDrop(e, node.id)}
                    className={clsx(
                        'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm border border-transparent',
                        isSelected ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-gray-300 hover:text-white',
                        isDragOver && 'border-primary bg-primary/10',
                        depth > 0 && 'ml-4'
                    )}
                    onClick={() => isFolder ? toggleFolder(node.id) : onSelect(node.id)}
                >
                    <span 
                        className={clsx("p-0.5 rounded hover:bg-white/10", isFolder ? "visible" : "invisible")}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (isFolder) toggleFolder(node.id)
                        }}
                    >
                        {isFolder && (
                            isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                        )}
                        {!isFolder && <ChevronRight className="w-3 h-3" />} 
                    </span>
                    
                    {isFolder ? <Folder className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4" />}
                    <span className="flex-1 truncate select-none">{node.title}</span>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        {isFolder && (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onCreateNote(node.id) }}
                                    className="p-1 hover:bg-white/20 rounded"
                                    title="New Note"
                                >
                                    <FilePlus className="w-3 h-3" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onCreateFolder(node.id) }}
                                    className="p-1 hover:bg-white/20 rounded"
                                    title="New Folder"
                                >
                                    <FolderPlus className="w-3 h-3" />
                                </button>
                            </>
                        )}
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRenameClick(node) }}
                            className="p-1 hover:bg-white/20 rounded"
                            title="Rename"
                        >
                            <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(node.id) }}
                            className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                            title="Delete"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
                {isFolder && isExpanded && (
                    <div>
                        {children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div 
            className="w-72 border-r border-white/10 h-full flex flex-col bg-surface/30 backdrop-blur-md"
            onDragOver={(e) => handleDragOver(e, null, true)} // Allow dropping on root (null parent)
            onDrop={(e) => handleDrop(e, null)}
        >
            {/* SRS Queue Section */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold mb-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span>Review Queue</span>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 cursor-pointer hover:bg-primary/20 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-primary">Due Today</span>
                        <span className="text-xs font-bold text-white bg-primary/20 px-1.5 py-0.5 rounded">15</span>
                    </div>
                    <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-2/3" />
                    </div>
                </div>
            </div>

            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold text-white">Library</h2>
                <div className="flex gap-1">
                    <button 
                        onClick={() => onCreateFolder(null)}
                        className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                        title="New Folder"
                    >
                        <FolderPlus className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onCreateNote(null)}
                        className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                        title="New Note"
                    >
                        <FilePlus className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className={clsx("flex-1 overflow-y-auto p-2", dragOverId === null && "bg-white/5")}>
                {notes.filter(n => n.parentId === null).map(node => renderNode(node))}
            </div>
        </div>
    )
}
