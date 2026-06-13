import { Modal } from '@/shared/components/modal'
import { JobForm } from './job-form'

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Add Job">
      <JobForm onCancel={onClose} onSubmit={onClose} />
    </Modal>
  )
}
