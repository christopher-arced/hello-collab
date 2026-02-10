import { useState } from 'react'
import type { BoardMember, Role } from '@hello/types'
import { Modal } from '@/components/common'
import { useBoardMembers } from '@/hooks/useBoardMembers'
import { useAuthStore } from '@/stores/authStore'
import { AddMemberForm, MemberListItem, MemberListSkeleton, ConfirmRemoveModal } from './members'

interface BoardMembersPanelProps {
  boardId: string
  boardOwnerId: string
  isOpen: boolean
  onClose: () => void
}

export function BoardMembersPanel({
  boardId,
  boardOwnerId,
  isOpen,
  onClose,
}: BoardMembersPanelProps) {
  const currentUser = useAuthStore((s) => s.user)
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(null)
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null)

  const {
    members,
    isLoading,
    addMemberAsync,
    isAdding,
    addError,
    updateRoleAsync,
    removeMemberAsync,
    isRemoving,
  } = useBoardMembers(boardId)

  const currentUserMembership = members.find((m) => m.userId === currentUser?.id)
  const isOwner = currentUserMembership?.role === 'OWNER' || boardOwnerId === currentUser?.id
  const canAddMembers = isOwner || currentUserMembership?.role === 'EDITOR'

  const canEditMemberRole = (member: BoardMember) => {
    return isOwner && member.userId !== boardOwnerId
  }

  const canRemoveMember = (member: BoardMember) => {
    if (member.userId === boardOwnerId) return false
    if (member.userId === currentUser?.id) return true
    if (isOwner) return true
    if (currentUserMembership?.role === 'EDITOR' && member.role === 'VIEWER') return true
    return false
  }

  const handleRoleChange = async (member: BoardMember, newRole: Role) => {
    setUpdatingMemberId(member.userId)
    try {
      await updateRoleAsync({ userId: member.userId, role: newRole })
    } finally {
      setUpdatingMemberId(null)
    }
  }

  const handleRemove = async () => {
    if (!memberToRemove) return
    try {
      await removeMemberAsync(memberToRemove.userId)
      setMemberToRemove(null)
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Board Members">
        <div className="space-y-6">
          {canAddMembers && (
            <AddMemberForm onSubmit={addMemberAsync} isLoading={isAdding} error={addError} />
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-theme-text-secondary dark:text-theme-dark-text-secondary">
              Members ({members.length})
            </h3>

            {isLoading ? (
              <MemberListSkeleton />
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <MemberListItem
                    key={member.id}
                    member={member}
                    isCurrentUser={member.userId === currentUser?.id}
                    canEditRole={canEditMemberRole(member)}
                    canRemove={canRemoveMember(member)}
                    isUpdating={updatingMemberId === member.userId}
                    onRoleChange={(role) => handleRoleChange(member, role)}
                    onRemove={() => setMemberToRemove(member)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmRemoveModal
        member={memberToRemove}
        isCurrentUser={memberToRemove?.userId === currentUser?.id}
        isLoading={isRemoving}
        onConfirm={handleRemove}
        onClose={() => setMemberToRemove(null)}
      />
    </>
  )
}
