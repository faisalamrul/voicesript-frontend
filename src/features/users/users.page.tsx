import { useState } from 'react'
import { IconUserPlus } from '@tabler/icons-react'
import Swal from 'sweetalert2'
import { useUsers } from './hooks/use-users'
import { UsersTable } from './components/users-table'
import { UserForm } from './components/user-form'
import { EditRoleForm } from './components/edit-role-form'
import type { AppUser } from './types/user.types'
import type { UserRole } from '@/shared/types'

export function UsersPage() {
  const { users, addUser, updateRole, deleteUser } = useUsers()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)

  function handleAddUser(data: Parameters<typeof addUser>[0]) {
    addUser(data)
    setIsAddOpen(false)
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'User baru berhasil ditambahkan.', confirmButtonColor: '#1F3A2F', timer: 2000, timerProgressBar: true })
  }

  function handleUpdateRole(id: string, role: UserRole) {
    updateRole(id, role)
    setEditingUser(null)
    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Role berhasil diubah.', confirmButtonColor: '#1F3A2F', timer: 1500, timerProgressBar: true })
  }

  return (
    <>
      <div>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Users</h1>
            <p className="mt-2 text-text-secondary">Kelola seluruh akun pengguna dan role mereka.</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <IconUserPlus size={16} />
            Tambah User
          </button>
        </div>

        <UsersTable users={users} onEditRole={setEditingUser} onDelete={deleteUser} />
      </div>

      {/* Modal Tambah User */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <UserForm onCancel={() => setIsAddOpen(false)} onSubmit={handleAddUser} />
          </div>
        </div>
      )}

      {/* Modal Edit Role */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => setEditingUser(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <EditRoleForm user={editingUser} onCancel={() => setEditingUser(null)} onSubmit={handleUpdateRole} />
          </div>
        </div>
      )}
    </>
  )
}
