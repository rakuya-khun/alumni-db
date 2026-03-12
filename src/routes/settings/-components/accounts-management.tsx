import { useState } from 'react'
import { Plus, Edit2, UserX, UserCheck } from 'lucide-react'
import { useAccounts } from '../-hooks/use-accounts'
import { AccountFormDialog } from './account-form-dialog'
import type { AccountEntry } from '../../../../shared/types/settings.types'

export function AccountsManagement() {
  const { accounts, loading, createAccount, updateAccount } = useAccounts()
  const [editingAccount, setEditingAccount] = useState<AccountEntry | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const handleToggleActive = async (account: AccountEntry) => {
    await updateAccount({
      username: account.username,
      isActive: !account.isActive,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Accounts</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-light"
        >
          <Plus className="h-4 w-4" /> Add Account
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-text-secondary">No accounts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-card-border text-text-secondary">
              <tr>
                <th className="pb-3 pr-4 font-medium">Username</th>
                <th className="pb-3 pr-4 font-medium">Full Name</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {accounts.map((a) => (
                <tr key={a.username}>
                  <td className="py-3 pr-4 font-medium text-text-primary">{a.username}</td>
                  <td className="py-3 pr-4 text-text-secondary">{a.fullName}</td>
                  <td className="py-3 pr-4 text-text-secondary">{a.role}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingAccount(a)} title="Edit"
                        className="rounded p-1.5 text-text-secondary hover:bg-surface-secondary">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleToggleActive(a)} title={a.isActive ? 'Deactivate' : 'Activate'}
                        className="rounded p-1.5 text-text-secondary hover:bg-surface-secondary">
                        {a.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <AccountFormDialog
          onSubmit={async (data) => { await createAccount(data); setShowCreate(false) }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editingAccount && (
        <AccountFormDialog
          account={editingAccount}
          onSubmit={async (data) => { await updateAccount(data); setEditingAccount(null) }}
          onClose={() => setEditingAccount(null)}
        />
      )}
    </div>
  )
}
