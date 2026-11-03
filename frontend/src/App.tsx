
import { useEffect, useState } from 'react'
import EntityForm from './components/EntityForm'
import EntityMap from './components/EntityMap'
import EntityList from './components/EntityList'
import Toast from './components/Toast'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import { createEntity, deleteEntity, getEntities, updateEntity } from './services/entityService'
import EntitySummary, { type SummaryFilter } from './components/EntitySummary'
import type { Entity } from './types/entity'
import { CircleCheck, CircleAlert, LoaderCircle } from 'lucide-react'
import './App.css'

type ToastType = 'success' | 'info' | 'delete' | 'error'

type ToastState = {
  message: string
  type: ToastType
}

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [editingEntity, setEditingEntity] =
    useState<Entity | null>(null)

  const [entities, setEntities] = useState<Entity[]>([])

  const [selectedEntity, setSelectedEntity] =
    useState<Entity | null>(null)

  const [summaryFilter, setSummaryFilter] =
    useState<SummaryFilter>('All')

  const [backendLoading, setBackendLoading] = useState(true)
  const [backendError, setBackendError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const [toast, setToast] =
    useState<ToastState | null>(null)

  const [deletingId, setDeletingId] =
    useState<number | null>(null)

  const [entityToDelete, setEntityToDelete] =
    useState<Entity | null>(null)

  const [deleteConfirmStep, setDeleteConfirmStep] =
    useState<1 | 2>(1)

  useEffect(() => {
    let active = true

    async function loadBackendEntities() {
      try {
        const data = await getEntities()

        if (active) {
          setEntities(data)
          setBackendError('')
        }
      } catch (error) {
        if (active) {
          setBackendError(
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat mengambil data.'
          )
        }
      } finally {
        if (active) {
          setBackendLoading(false)
        }
      }
    }

    void loadBackendEntities()

    return () => {
      active = false
    }
  }, [])

  function showToast(
    message: string,
    type: ToastType = 'success'
  ) {
    setToast({ message, type })
  }

  useEffect(() => {
    if (!toast) return

    const timeoutId = window.setTimeout(() => {
      setToast(null)
    }, 4000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [toast])

  async function handleAddEntity(
    newEntity: Entity
  ): Promise<void> {
    try {
      const {
        id: _temporaryId,
        ...entityPayload
      } = newEntity

      void _temporaryId

      const createdEntity =
        await createEntity(entityPayload)

      setEntities((previousEntities) => {
        const alreadyExists = previousEntities.some(
          (entity) => entity.id === createdEntity.id
        )

        if (alreadyExists) {
          return previousEntities.map((entity) =>
            entity.id === createdEntity.id
              ? createdEntity
              : entity
          )
        }

        return [...previousEntities, createdEntity]
      })

      showToast(
        `Entitas "${createdEntity.name}" berhasil ditambahkan.`,
        'success'
      )
    } catch (error) {
      console.error('Gagal menambahkan entitas:', error)

      showToast(
        error instanceof Error
          ? `Gagal menambahkan entitas: ${error.message}`
          : 'Gagal menambahkan entitas.',
        'error'
      )

      throw error
    }
  }

  async function handleUpdateEntity(
    updatedEntity: Entity
  ): Promise<void> {
    try {
      const savedEntity =
        await updateEntity(updatedEntity)

      setEntities((previousEntities) =>
        previousEntities.map((entity) =>
          entity.id === savedEntity.id
            ? savedEntity
            : entity
        )
      )

      showToast(
        `Entitas "${savedEntity.name}" berhasil diperbarui.`,
        'info'
      )
    } catch (error) {
      console.error('Gagal memperbarui entitas:', error)

      showToast(
        error instanceof Error
          ? `Gagal memperbarui entitas: ${error.message}`
          : 'Gagal memperbarui entitas.',
        'error'
      )

      throw error
    }
  }

  async function handleDeleteEntity(
    id: number
  ): Promise<void> {
    if (deletingId !== null) return

    const selectedEntity = entities.find(
      (entity) => entity.id === id
    )

    if (!selectedEntity) return

    setDeletingId(id)
    setDeleteError('')

    try {
      await deleteEntity(id)

      setEntities((previousEntities) =>
        previousEntities.filter(
          (entity) => entity.id !== id
        )
      )

      setEntityToDelete(null)
      setDeleteConfirmStep(1)

      showToast(
        `Entitas "${selectedEntity.name}" berhasil dihapus.`,
        'delete'
      )
    } catch (error) {
      console.error('Gagal menghapus entitas:', error)

      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menghapus entitas.'

      setDeleteError(message)

      showToast(
        `Gagal menghapus entitas: ${message}`,
        'error'
      )

    } finally {
      setDeletingId(null)
    }
  }

  function handleOpenDelete(id: number) {
    if (deletingId !== null) return

    const selectedEntity = entities.find(
      (entity) => entity.id === id
    )

    if (!selectedEntity) return

    setDeleteError('')
    setDeleteConfirmStep(1)
    setEntityToDelete(selectedEntity)
  }

  function handleCloseDelete() {
    if (deletingId !== null) return

    setEntityToDelete(null)
    setDeleteConfirmStep(1)
    setDeleteError('')
  }

  function handleNextDeleteConfirmation() {
    if (deletingId !== null) return

    setDeleteConfirmStep(2)
  }

  function handleBackDeleteConfirmation() {
    if (deletingId !== null) return

    setDeleteConfirmStep(1)
  }

  function handleOpenEdit(entity: Entity) {
    setEditingEntity(entity)
    setIsFormOpen(true)
  }

  function handleViewLocation(entity: Entity) {
    setSelectedEntity(null)

    window.requestAnimationFrame(() => {
      setSelectedEntity(entity)
    })

    document.getElementById('entity-map')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function handleOpenAdd() {
    setEditingEntity(null)
    setIsFormOpen(true)
  }

  function handleCloseForm() {
    setIsFormOpen(false)
    setEditingEntity(null)
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>GeoTrack</h1>

          <h2>
            Geographic Entity Management System
          </h2>

          <p>
            Aplikasi untuk mengelola dan memantau lokasi
            geografis kendaraan, perangkat IoT, dan fasilitas.
          </p>
        </div>

        <div className="header-actions">
          <div
            className={`api-status ${
              backendLoading
                ? 'api-loading'
                : backendError
                  ? 'api-error'
                  : 'api-connected'
            }`}
            role="status"
          >
            {backendLoading ? (
              <>
                <LoaderCircle size={15} />
                <span>Connecting...</span>
              </>
            ) : backendError ? (
              <>
                <CircleAlert size={15} />
                <span>API Disconnected</span>
              </>
            ) : (
              <>
                <CircleCheck size={15} />
                <span>API Connected</span>
              </>
            )}
          </div>

          <button
            type="button"
            className="add-entity-btn"
            onClick={handleOpenAdd}
          >
            + Tambah Entitas
          </button>
        </div>
      </header>

      <EntitySummary
        entities={entities}
        selectedFilter={summaryFilter}
        onFilterChange={setSummaryFilter}
      />

      <section id="entity-map" className="map-section">
        <div className="section-header">
          <h3>Peta Lokasi Entitas</h3>

          <p>
            Visualisasi lokasi geografis seluruh entitas.
          </p>
        </div>

        <div className="map-legend">
          <div className="map-legend-item">
            <span className="legend-dot legend-active" />
            <span>Active</span>
          </div>

          <div className="map-legend-item">
            <span className="legend-dot legend-inactive" />
            <span>Inactive</span>
          </div>
        </div>

        <EntityMap entities={entities} selectedEntity={selectedEntity} />
      </section>

      {deleteError && !entityToDelete && (
        <p role="alert" style={{ color: '#dc2626' }}>
          {deleteError}
        </p>
      )}

      <EntityList
        entities={entities}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onViewLocation={handleViewLocation}
        deletingId={deletingId}
        isDeleting={deletingId !== null}
        summaryFilter={summaryFilter}
        onSummaryFilterChange={setSummaryFilter}
      />

      {isFormOpen && (
        <EntityForm
          onClose={handleCloseForm}
          onSave={handleAddEntity}
          onEdit={handleUpdateEntity}
          editingEntity={editingEntity}
        />
      )}

      {entityToDelete && (
        <DeleteConfirmModal
          entityName={entityToDelete.name}
          isDeleting={deletingId !== null}
          step={deleteConfirmStep}
          onCancel={handleCloseDelete}
          onBack={handleBackDeleteConfirmation}
          onConfirm={
            deleteConfirmStep === 1
              ? handleNextDeleteConfirmation
              : () => handleDeleteEntity(entityToDelete.id)
          }
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  )
}

export default App