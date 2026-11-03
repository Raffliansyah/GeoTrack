import { useState } from 'react'
import type { Entity } from '../types/entity'
import type { SummaryFilter } from './EntitySummary'
import { MapPin, Pencil, Trash2 } from 'lucide-react'

type EntityListProps = {
  entities: Entity[]
  onEdit: (entity: Entity) => void
  onDelete: (id: number) => void
  onViewLocation: (entity: Entity) => void
  deletingId: number | null
  isDeleting: boolean
  summaryFilter: SummaryFilter
  onSummaryFilterChange: (filter: SummaryFilter) => void
}

function EntityList({ entities, onEdit, onDelete, onViewLocation, deletingId, isDeleting, summaryFilter, onSummaryFilterChange }: EntityListProps) {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const effectiveType =
    summaryFilter === 'Vehicle' ||
    summaryFilter === 'IoT Device' ||
    summaryFilter === 'Facility'
      ? summaryFilter
      : selectedType

  const effectiveStatus =
    summaryFilter === 'Active' ||
    summaryFilter === 'Inactive'
      ? summaryFilter
      : selectedStatus

  const handleResetFilter = () => {
    setSearch('')
    setCurrentPage(1)
    setSelectedType('All')
    setSelectedStatus('All')
    onSummaryFilterChange('All')
  }

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = entity.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())

    const matchesType =
      effectiveType === 'All' ||
      entity.type === effectiveType

    const matchesStatus =
      effectiveStatus === 'All' ||
      entity.status === effectiveStatus

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus
    )
  })

  const totalItems = filteredEntities.length

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize)
  )

  const safeCurrentPage = Math.min(currentPage, totalPages)

  const startIndex = (safeCurrentPage - 1) * pageSize

  const paginatedEntities = filteredEntities.slice(
    startIndex,
    startIndex + pageSize
  )

  const startItem = totalItems === 0 ? 0 : startIndex + 1

  const endItem = Math.min(startIndex + pageSize, totalItems)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <section className="entity-list">
      <div className="section-header">
        <h3>Daftar Entitas</h3>
        <p>
          Daftar kendaraan, perangkat IoT, dan fasilitas
          yang terdaftar dalam GeoTrack.
        </p>
      </div>

      <div className="entity-toolbar">
        <input
            type="search"
            className="search-input"
            placeholder="Cari nama entitas..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Cari nama entitas"
        />

        <select
            className="filter-select"
            value={effectiveType}
            onChange={(event) => {
              const value = event.target.value
              setSelectedType(value)

              if (summaryFilter !== 'All') {
                onSummaryFilterChange('All')
              }
            }}
            aria-label="Filter tipe entitas"
        >
            <option value="All">Semua Tipe</option>
            <option value="Vehicle">Vehicle</option>
            <option value="IoT Device">IoT Device</option>
            <option value="Facility">Facility</option>
        </select>

        <select
            className="filter-select"
            value={effectiveStatus}
            onChange={(event) => {
              const value = event.target.value
              setSelectedStatus(value)

              if (summaryFilter !== 'All') {
                onSummaryFilterChange('All')
              }
            }}
            aria-label="Filter status entitas"
        >
            <option value="All">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
        </select>

        <button
            type="button"
            className="reset-filter-btn"
            onClick={handleResetFilter}
            disabled={
              search.trim() === '' &&
              effectiveType === 'All' &&
              effectiveStatus === 'All'
            }
        >
            Reset Filter
        </button>
      </div>

      <div className="table-wrapper">
        <table className="entity-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Entitas</th>
              <th>Tipe</th>
              <th>Status</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedEntities.length > 0 ? (
              paginatedEntities.map((entity, index) => (
                <tr key={entity.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{entity.name}</td>
                  <td>{entity.type}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        entity.status === 'Active'
                          ? 'status-active'
                          : 'status-inactive'
                      }`}
                    >
                      {entity.status}
                    </span>
                  </td>
                  <td>{entity.latitude}</td>
                  <td>{entity.longitude}</td>
                  <td>
                    <div className="entity-actions">
                        <button
                          type="button"
                          className="location-btn"
                          onClick={() => onViewLocation(entity)}
                          disabled={isDeleting}
                          title={`Lihat lokasi ${entity.name} di peta`}
                        >
                          <MapPin size={15} />
                          <span>Lihat Lokasi</span>
                        </button>

                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => onEdit(entity)}
                          disabled={isDeleting}
                          title={`Edit ${entity.name}`}
                        >
                          <Pencil size={15} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => onDelete(entity.id)}
                          disabled={isDeleting}
                          aria-busy={deletingId === entity.id}
                          title={`Hapus ${entity.name}`}
                        >
                          <Trash2 size={15} />
                          <span>
                            {deletingId === entity.id
                              ? 'Menghapus...'
                              : 'Hapus'}
                          </span>
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-state">
                  Tidak ada entitas yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <div className="pagination-info">
          <span>Tampilkan</span>

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setCurrentPage(1)
            }}
            aria-label="Jumlah data per halaman"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <span>
            Menampilkan {startItem}–{endItem} dari {totalItems} entitas
          </span>
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            aria-label="Halaman sebelumnya"
          >
            ‹
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              key={page}
              type="button"
              className={
                safeCurrentPage === page
                  ? 'pagination-page active'
                  : 'pagination-page'
              }
              onClick={() => handlePageChange(page)}
              aria-current={
                safeCurrentPage === page ? 'page' : undefined
              }
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            aria-label="Halaman berikutnya"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

export default EntityList