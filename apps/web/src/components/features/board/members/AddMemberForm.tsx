import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addBoardMemberSchema, AddBoardMemberInput } from '@hello/validation'
import { Role, type BoardMember } from '@hello/types'
import { Input, Button } from '@/components/common'
import { ApiError } from '@/lib/api'

interface AddMemberFormProps {
  onSubmit: (data: AddBoardMemberInput) => Promise<BoardMember>
  isLoading: boolean
  error: ApiError | null
  memberEmails: string[]
}

export function AddMemberForm({ onSubmit, isLoading, error, memberEmails }: AddMemberFormProps) {
  const [localError, setLocalError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddBoardMemberInput>({
    resolver: zodResolver(addBoardMemberSchema),
    defaultValues: { role: Role.VIEWER },
  })

  const handleFormSubmit = async (data: AddBoardMemberInput) => {
    setLocalError(null)

    if (memberEmails.includes(data.email.toLowerCase())) {
      setLocalError('This user is already a member of the board')
      return
    }

    try {
      await onSubmit(data)
      reset()
    } catch {
      // Error handled by parent
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter email address"
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>
        <select
          {...register('role')}
          className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 text-theme-text dark:text-theme-dark-text focus:outline-none focus:border-indigo-500/50"
        >
          <option
            value={Role.VIEWER}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            Viewer
          </option>
          <option
            value={Role.EDITOR}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            Editor
          </option>
        </select>
      </div>

      {(error || localError) && (
        <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{localError ?? error?.message}</p>
        </div>
      )}

      <Button type="submit" variant="gradient" loading={isLoading} className="w-full">
        {isLoading ? 'Adding...' : 'Add Member'}
      </Button>
    </form>
  )
}
