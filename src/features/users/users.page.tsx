import { useState } from 'react'
import { IconUserPlus } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { Modal } from '@/shared/components/modal'
import { UsersTable } from './components/users-table'
import { UserForm } from './components/user-form'
import { EditRoleForm } from './components/edit-role-form'
import { createUser, updateUserRole, type CreateUserPayload } from './api/users.api'
import { useAuthStore } from '@/store/auth.store'
import { SWAL_PRIMARY } from '@/shared/constants'
import type { AppUser } from './types/user.types'
import type { UserRole } from '@/shared/types'

export function UsersPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)

  async function handleAddUser(data: CreateUserPayload) {
    Swal.fire({ title: 'Saving...', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() })
    try {
      await createUser(data)
      setIsAddOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      Swal.fire({ icon: 'success', title: 'Success!', text: 'New user added successfully.', confirmButtonColor: SWAL_PRIMARY, timer: 2000, timerProgressBar: true })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err instanceof Error ? err.message : 'Something went wrong.', confirmButtonColor: SWAL_PRIMARY })
    }
  }

  async function handleUpdateRole(id: string, role: UserRole) {
    if (id === currentUser?.id) {
      Swal.fire({ icon: 'warning', title: 'Not allowed', text: 'You cannot change your own role.', confirmButtonColor: SWAL_PRIMARY })
      return
    }
    if (editingUser?.role === 'admin') {
      Swal.fire({ icon: 'warning', title: 'Not allowed', text: 'Admin role cannot be changed.', confirmButtonColor: SWAL_PRIMARY })
      return
    }
    Swal.fire({ title: 'Saving...', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() })
    try {
      await updateUserRole(id, role)
      setEditingUser(null)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      Swal.fire({ icon: 'success', title: 'Success!', text: 'Role updated successfully.', confirmButtonColor: SWAL_PRIMARY, timer: 1500, timerProgressBar: true })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err instanceof Error ? err.message : 'Something went wrong.', confirmButtonColor: SWAL_PRIMARY })
    }
  }

  return (
    <>
      <div>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Users</h1>
            <p className="mt-2 text-text-secondary">Manage all user accounts and their roles.</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <IconUserPlus size={16} aria-hidden="true" />
            Add User
          </button>
        </div>

        <UsersTable onEditRole={setEditingUser} currentUserId={currentUser?.id} />
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} label="Add User">
        <UserForm onCancel={() => setIsAddOpen(false)} onSubmit={handleAddUser} />
      </Modal>

      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} label="Edit Role">
        {editingUser && (
          <EditRoleForm user={editingUser} onCancel={() => setEditingUser(null)} onSubmit={handleUpdateRole} />
        )}
      </Modal>
    </>
  )
}
