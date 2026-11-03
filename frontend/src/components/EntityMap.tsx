import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Entity } from '../types/entity'
import 'leaflet/dist/leaflet.css'

function createStatusIcon(status: string) {
  const color =
    status === 'Active' ? '#16a34a' : '#dc2626'

  return L.divIcon({
    className: 'entity-map-marker',
    html: `
      <div class="entity-pin" style="--pin-color: ${color}">
        <span class="entity-pin-center"></span>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

const activeIcon = createStatusIcon('Active')
const inactiveIcon = createStatusIcon('Inactive')

type EntityMapProps = {
  entities: Entity[]
  selectedEntity: Entity | null
}

type MapFocusProps = {
  selectedEntity: Entity | null
  markerRefs: React.RefObject<Map<number, L.Marker>>
}

function MapFocus({
  selectedEntity,
  markerRefs,
}: MapFocusProps) {
  const map = useMap()

  useEffect(() => {
    if (!selectedEntity) return

    const { latitude, longitude, id } = selectedEntity

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return
    }

    map.flyTo(
      [latitude, longitude],
      16,
      {
        animate: true,
        duration: 1.5,
      }
    )

    const openPopup = () => {
      markerRefs.current.get(id)?.openPopup()
    }

    map.once('moveend', openPopup)

    return () => {
      map.off('moveend', openPopup)
    }
  }, [selectedEntity, map, markerRefs])

  return null
}

function EntityMap({
  entities,
  selectedEntity,
}: EntityMapProps) {
  const markerRefs = useRef<Map<number, L.Marker>>(
    new Map()
  )

  return (
    <MapContainer
      center={[-6.2088, 106.8456]}
      zoom={12}
      scrollWheelZoom={true}
      style={{
        height: '500px',
        width: '100%',
        borderRadius: '12px',
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapFocus
        selectedEntity={selectedEntity}
        markerRefs={markerRefs}
      />

      {entities.map((entity) => (
        <Marker
          key={entity.id}
          position={[
            entity.latitude,
            entity.longitude,
          ]}
          icon={
            entity.status === 'Active'
              ? activeIcon
              : inactiveIcon
          }
          ref={(marker) => {
            if (marker) {
              markerRefs.current.set(entity.id, marker)
            } else {
              markerRefs.current.delete(entity.id)
            }
          }}
        >
          <Popup
            className="geotrack-popup"
            minWidth={260}
            maxWidth={320}
          >
            <div className="map-popup-content">
              <div className="map-popup-header">
                <span className="map-popup-category">
                  {entity.type}
                </span>

                <span
                  className={`map-popup-status ${
                    entity.status === 'Active'
                      ? 'map-popup-status-active'
                      : 'map-popup-status-inactive'
                  }`}
                >
                  <span className="map-popup-status-dot" />
                  {entity.status}
                </span>
              </div>

              <h3 className="map-popup-title">
                {entity.name}
              </h3>

              <div className="map-popup-divider" />

              <div className="map-popup-details">
                <div className="map-popup-detail-row">
                  <span>Latitude</span>
                  <strong>
                    {entity.latitude.toFixed(6)}
                  </strong>
                </div>

                <div className="map-popup-detail-row">
                  <span>Longitude</span>
                  <strong>
                    {entity.longitude.toFixed(6)}
                  </strong>
                </div>
              </div>

              <div className="map-popup-footer">
                <span className="map-popup-id">
                  Entity ID: #{entity.id}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default EntityMap