import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import BoardCanvas from './BoardCanvas'
import type { List } from '@hello/types'

// Mock dnd-kit to avoid complex drag event simulation
vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core')
  return {
    ...actual,
    DndContext: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="dnd-context">{children}</div>
    ),
    DragOverlay: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="drag-overlay">{children}</div>
    ),
    useSensors: () => [],
    useSensor: () => ({}),
  }
})

vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual('@dnd-kit/sortable')
  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sortable-context">{children}</div>
    ),
  }
})

// Mock ListCard to simplify testing
vi.mock('./ListCard', () => ({
  default: ({
    list,
    onUpdateTitle,
    onDelete,
  }: {
    list: List
    onUpdateTitle: (title: string) => void
    onDelete: () => void
  }) => (
    <div data-testid={`list-card-${list.id}`}>
      <span>{list.title}</span>
      <button onClick={() => onUpdateTitle('Updated')}>Update</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}))

// Mock AddListForm
vi.mock('./AddListForm', () => ({
  default: ({
    onAdd,
    isAdding,
  }: {
    onAdd: (title: string) => Promise<void>
    isAdding?: boolean
  }) => (
    <div data-testid="add-list-form">
      <button onClick={() => onAdd('New List')} disabled={isAdding}>
        Add List
      </button>
    </div>
  ),
}))

const mockLists: List[] = [
  {
    id: 'list-1',
    title: 'To Do',
    boardId: 'board-1',
    position: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'list-2',
    title: 'In Progress',
    boardId: 'board-1',
    position: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'list-3',
    title: 'Done',
    boardId: 'board-1',
    position: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('BoardCanvas', () => {
  const mockOnCreateList = vi.fn()
  const mockOnUpdateList = vi.fn()
  const mockOnDeleteList = vi.fn()
  const mockOnReorderLists = vi.fn()
  const mockOnReorderCards = vi.fn()
  const mockOnMoveCard = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnCreateList.mockResolvedValue(undefined)
    mockOnDeleteList.mockResolvedValue(undefined)
  })

  it('renders loading state', () => {
    render(
      <BoardCanvas
        lists={[]}
        boardColor="#6366f1"
        isLoading={true}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    // Should show loading skeletons
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(3)
  })

  it('renders all lists', () => {
    render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    expect(screen.getByTestId('list-card-list-1')).toBeInTheDocument()
    expect(screen.getByTestId('list-card-list-2')).toBeInTheDocument()
    expect(screen.getByTestId('list-card-list-3')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders AddListForm', () => {
    render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    expect(screen.getByTestId('add-list-form')).toBeInTheDocument()
  })

  it('renders with DndContext wrapper', () => {
    render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  it('renders with SortableContext for lists', () => {
    render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    expect(screen.getByTestId('sortable-context')).toBeInTheDocument()
  })

  it('renders DragOverlay', () => {
    render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument()
  })

  it('applies board color to background', () => {
    const { container } = render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    const boardContainer = container.querySelector('[style*="background-color"]')
    expect(boardContainer).toBeInTheDocument()
  })

  it('calls onCreateList when AddListForm submits', async () => {
    render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    const addButton = screen.getByRole('button', { name: 'Add List' })
    addButton.click()

    expect(mockOnCreateList).toHaveBeenCalledWith('New List')
  })

  it('calls onUpdateList when list title is updated', async () => {
    render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    const updateButtons = screen.getAllByRole('button', { name: 'Update' })
    updateButtons[0].click()

    expect(mockOnUpdateList).toHaveBeenCalledWith('list-1', 'Updated')
  })

  it('calls onDeleteList when list is deleted', async () => {
    render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' })
    deleteButtons[0].click()

    expect(mockOnDeleteList).toHaveBeenCalledWith('list-1')
  })

  it('passes isCreating prop to AddListForm', () => {
    render(
      <BoardCanvas
        lists={mockLists}
        boardColor="#6366f1"
        isLoading={false}
        isCreating={true}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    const addButton = screen.getByRole('button', { name: 'Add List' })
    expect(addButton).toBeDisabled()
  })

  it('renders empty state when no lists', () => {
    render(
      <BoardCanvas
        lists={[]}
        boardColor="#6366f1"
        isLoading={false}
        onCreateList={mockOnCreateList}
        onUpdateList={mockOnUpdateList}
        onDeleteList={mockOnDeleteList}
      />
    )

    // Should only show AddListForm, no list cards
    expect(screen.getByTestId('add-list-form')).toBeInTheDocument()
    expect(screen.queryByTestId('list-card-list-1')).not.toBeInTheDocument()
  })

  describe('drag and drop callbacks', () => {
    it('accepts onReorderLists callback', () => {
      render(
        <BoardCanvas
          lists={mockLists}
          boardColor="#6366f1"
          isLoading={false}
          onCreateList={mockOnCreateList}
          onUpdateList={mockOnUpdateList}
          onDeleteList={mockOnDeleteList}
          onReorderLists={mockOnReorderLists}
        />
      )

      // Component should render without errors when callback is provided
      expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
    })

    it('accepts onReorderCards callback', () => {
      render(
        <BoardCanvas
          lists={mockLists}
          boardColor="#6366f1"
          isLoading={false}
          onCreateList={mockOnCreateList}
          onUpdateList={mockOnUpdateList}
          onDeleteList={mockOnDeleteList}
          onReorderCards={mockOnReorderCards}
        />
      )

      expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
    })

    it('accepts onMoveCard callback', () => {
      render(
        <BoardCanvas
          lists={mockLists}
          boardColor="#6366f1"
          isLoading={false}
          onCreateList={mockOnCreateList}
          onUpdateList={mockOnUpdateList}
          onDeleteList={mockOnDeleteList}
          onMoveCard={mockOnMoveCard}
        />
      )

      expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
    })
  })
})
