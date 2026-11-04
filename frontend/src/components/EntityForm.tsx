import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Entity } from '../types/entity'
import { MapPinPlus, Pencil, X, Save, MapPinned } from 'lucide-react'

type EntityFormProps = {
  onClose: () => void
  onSave: (entity: Entity) => Promise<void>
  onEdit: (entity: Entity) => Promise<void>
  editingEntity: Entity | null
}

function EntityForm({ onClose, onSave, onEdit, editingEntity }: EntityFormProps) {
  const [name, setName] = useState(editingEntity?.name ?? '')
    const [type, setType] = useState(editingEntity?.type ?? '')
    const [status, setStatus] = useState(editingEntity?.status ?? 'Active')

    const [latitude, setLatitude] = useState(
        editingEntity ? String(editingEntity.latitude) : ''
    )

    const [longitude, setLongitude] = useState(
        editingEntity ? String(editingEntity.longitude) : ''
    )

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
  
  const handleCoordinateChange = (
    value: string,
    field: 'latitude' | 'longitude'
  ) => {
    const coordinateRegex = /^-?\d*\.?\d*$/

    if (!coordinateRegex.test(value)) {
      return
    }

    if (field === 'latitude') {
      setLatitude(value)
    } else {
      setLongitude(value)
    }
  }

  const lat = Number(latitude)
  const lng = Number(longitude)

  const validCoordinateFormat = /^-?(?:\d+\.?\d*|\.\d+)$/

  const isLatitudeFormatValid = validCoordinateFormat.test(latitude)
  const isLongitudeFormatValid = validCoordinateFormat.test(longitude)

  const isValidType =
    type === 'Vehicle' ||
    type === 'IoT Device' ||
    type === 'Facility'

  const isValidStatus =
    status === 'Active' ||
    status === 'Inactive'

  const isFormValid =
    name.trim().length > 0 &&
    isValidType &&
    isValidStatus &&
    isLatitudeFormatValid &&
    isLongitudeFormatValid &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isFormValid || isSubmitting) return

    const entityData: Entity = {
        id: editingEntity ? editingEntity.id : Date.now(),
        name: name.trim(),
        type,
        status,
        latitude: lat,
        longitude: lng,
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
        if (editingEntity) {
        await onEdit(entityData)
        } else {
        await onSave(entityData)
        }

        onClose()
    } catch (error) {
        console.error('Gagal menyimpan entitas:', error)

        setSubmitError(
        error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat menyimpan entitas.'
        )
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div
        className="entity-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-modal-title"
      >
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-header-icon">
              {editingEntity ? (
                <Pencil size={22} />
              ) : (
                <MapPinPlus size={22} />
              )}
            </div>

            <div className="modal-header-text">
              <h2 id="entity-modal-title">
                {editingEntity
                  ? 'Edit Entitas'
                  : 'Tambah Entitas Baru'}
              </h2>

              <p>
                {editingEntity
                  ? 'Perbarui informasi dan lokasi geografis entitas.'
                  : 'Lengkapi informasi dan koordinat geografis entitas.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="entity-modal-form">
          <div className="modal-body">
            <div className="form-section-title">
              Informasi Entitas
            </div>

            <div className="form-group">
              <label htmlFor="entity-name">
                Nama Entitas <span className="form-required">*</span>
              </label>

              <input
                id="entity-name"
                type="text"
                placeholder="Contoh: Kendaraan Operasional Jakarta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="entity-type">
                  Tipe Entitas <span className="form-required">*</span>
                </label>

                <select
                  id="entity-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="" disabled>Pilih Tipe</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="IoT Device">IoT Device</option>
                  <option value="Facility">Facility</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="entity-status">
                  Status <span className="form-required">*</span>
                </label>

                <select
                  id="entity-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-section-title form-location-title">
              <MapPinned size={17} />
              Koordinat Geografis
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="entity-latitude">
                  Latitude <span className="form-required">*</span>
                </label>

                <input
                  id="entity-latitude"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Contoh: -6.2088"
                  value={latitude}
                  onChange={(e) =>
                    handleCoordinateChange(e.target.value, 'latitude')
                  }
                  required
                />

                {latitude.trim() !== '' &&
                  (!isLatitudeFormatValid ||
                    !Number.isFinite(lat) ||
                    lat < -90 ||
                    lat > 90) && (
                    <small className="form-error" role="alert">
                      Latitude harus berupa angka antara -90 sampai 90.
                    </small>
                  )}
              </div>

              <div className="form-group">
                <label htmlFor="entity-longitude">
                  Longitude <span className="form-required">*</span>
                </label>

                <input
                  id="entity-longitude"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="Contoh: 106.8456"
                  value={longitude}
                  onChange={(e) =>
                    handleCoordinateChange(e.target.value, 'longitude')
                  }
                  required
                />

                {longitude.trim() !== '' &&
                  (!isLongitudeFormatValid ||
                    !Number.isFinite(lng) ||
                    lng < -180 ||
                    lng > 180) && (
                    <small className="form-error" role="alert">
                      Longitude harus berupa angka antara -180 sampai 180.
                    </small>
                  )}
              </div>
            </div>

            <p className="form-helper-text">
              Gunakan koordinat desimal. Latitude -90 hingga 90,
              longitude -180 hingga 180.
            </p>

            {submitError && (
              <p className="form-submit-error" role="alert">
                {submitError}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="form-cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>

            <button
              type="submit"
              className="form-submit-btn"
              disabled={!isFormValid || isSubmitting}
            >
              <Save size={16} />
              {isSubmitting
                ? 'Menyimpan...'
                : editingEntity
                  ? 'Simpan Perubahan'
                  : 'Simpan Entitas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EntityForm