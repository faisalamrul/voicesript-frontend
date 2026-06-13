import { useState, useEffect, useRef } from 'react'
import { IconEdit, IconX, IconCheck, IconLoader2 } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { useFocusTrap } from '@/shared/hooks/use-focus-trap'
import { useEditors } from '../hooks/use-editors'
import { assignEditor } from '../api/jobs.api'
import { getInitials, formatDurationLabel } from '../utils/modal-helpers'
import { SWAL_PRIMARY } from '@/shared/constants'
import type { Job } from '../types/job.types'
import type { Editor } from '../api/jobs.api'

// ─── Editor Tag ───────────────────────────────────────────────────────────────

function EditorTag({ editor }: { editor: Editor }) {
  if (editor.has_active_job) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400">
        On job
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500">
      Available
    </span>
  )
}

// ─── Editor Row ───────────────────────────────────────────────────────────────

function EditorRow({ editor, selected, onSelect }: {
  editor: Editor
  selected: boolean
  onSelect: () => void
}) {
  const disabled = editor.has_active_job
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all
        ${selected
          ? 'border-primary bg-primary-subtle'
          : disabled
          ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 cursor-pointer'
        }`}
    >
      <span
        className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-semibold
          ${selected ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}
        aria-hidden="true"
      >
        {getInitials(editor.name)}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${selected ? 'text-primary' : 'text-gray-900'}`}>
          {editor.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {editor.has_active_job ? 'on job' : 'available'}
        </p>
      </div>

      <EditorTag editor={editor} />

      {selected && <IconCheck size={16} className="text-primary flex-shrink-0" aria-hidden="true" />}
    </button>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface AssignEditorModalProps {
  job: Job
  onClose: () => void
}

export function AssignEditorModal({ job, onClose }: AssignEditorModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useFocusTrap<HTMLDivElement>()
  const queryClient = useQueryClient()

  const { data: editors = [], isLoading: loadingEditors } = useEditors()

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const sorted = [...editors].sort((a, b) => {
    if (a.has_active_job !== b.has_active_job) return a.has_active_job ? 1 : -1
    return 0
  })

  const selected = editors.find((e) => e.id === selectedId)

  async function handleConfirm() {
    if (!selectedId) return
    setLoading(true)
    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    })
    try {
      await assignEditor(job.id, selectedId)
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
      await queryClient.invalidateQueries({ queryKey: ['editors'] })
      await Swal.fire({
        icon: 'success',
        title: 'Editor Assigned!',
        text: `${selected?.name} has been assigned to this job.`,
        confirmButtonColor: SWAL_PRIMARY,
        timer: 2000,
        timerProgressBar: true,
      })
      onClose()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to assign editor.',
        confirmButtonColor: SWAL_PRIMARY,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Assign Editor"
        className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-primary flex items-start gap-3 px-5 py-5 rounded-t-2xl">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-white/10 flex items-center justify-center" aria-hidden="true">
            <IconEdit size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white">Assign Editor</h3>
            <p className="text-xs text-white/60 mt-0.5 truncate">{job.case_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <IconX size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Job info strip */}
        <div className="px-5 pt-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-sm font-semibold text-gray-800">{formatDurationLabel(job.duration)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Editor pay</p>
              <p className="text-sm font-semibold text-emerald-600">Rp 50.000</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Flat fee</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Status after</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700">
                REVIEWED
              </span>
            </div>
          </div>
        </div>

        {/* Editor list */}
        <div className="px-5 pt-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
            Available editors
          </p>

          {loadingEditors ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <IconLoader2 size={18} className="animate-spin mr-2" aria-hidden="true" />
              <span className="text-sm">Loading editors...</span>
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No editors found.</p>
          ) : (
            <div className="flex flex-col gap-2 pb-2">
              {sorted.map((editor) => (
                <EditorRow
                  key={editor.id}
                  editor={editor}
                  selected={selectedId === editor.id}
                  onSelect={() => setSelectedId(editor.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-bg-surface border-t border-border-base flex items-center justify-between rounded-b-2xl">
          <p className="text-xs text-gray-400" role="status" aria-live="polite">
            {selected
              ? <span className="text-gray-600 font-medium">{selected.name} selected</span>
              : 'Select an editor to continue'
            }
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              autoFocus
              onClick={onClose}
              disabled={loading}
              className="h-9 px-5 text-sm text-text-secondary border border-border-base rounded-lg bg-white hover:bg-white/80 transition disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedId || loading}
              className="h-9 px-5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              {loading ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconCheck size={14} aria-hidden="true" />
                  <span>Assign Editor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
