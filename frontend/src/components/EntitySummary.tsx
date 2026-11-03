import { Layers3, CircleCheck, CircleX,CarFront, Cpu, Building2 } from 'lucide-react'
import type { Entity } from '../types/entity'

export type SummaryFilter =
  | 'All'
  | 'Active'
  | 'Inactive'
  | 'Vehicle'
  | 'IoT Device'
  | 'Facility'

type EntitySummaryProps = {
  entities: Entity[]
  selectedFilter: SummaryFilter
  onFilterChange: (filter: SummaryFilter) => void
}

function EntitySummary({
  entities,
  selectedFilter,
  onFilterChange,
}: EntitySummaryProps) {
  const totalEntities = entities.length

  const activeEntities = entities.filter(
    (entity) => entity.status === 'Active'
  ).length

  const inactiveEntities = entities.filter(
    (entity) => entity.status === 'Inactive'
  ).length

  const vehicleCount = entities.filter(
    (entity) => entity.type === 'Vehicle'
  ).length

  const iotCount = entities.filter(
    (entity) => entity.type === 'IoT Device'
  ).length

  const facilityCount = entities.filter(
    (entity) => entity.type === 'Facility'
  ).length

  const summaryCards = [
    {
      filter: 'All' as SummaryFilter,
      label: 'Total Entitas',
      value: totalEntities,
      icon: Layers3,
      className: 'summary-total',
    },
    {
      filter: 'Active' as SummaryFilter,
      label: 'Active',
      value: activeEntities,
      icon: CircleCheck,
      className: 'summary-active',
    },
    {
      filter: 'Inactive' as SummaryFilter,
      label: 'Inactive',
      value: inactiveEntities,
      icon: CircleX,
      className: 'summary-inactive',
    },
    {
      filter: 'Vehicle' as SummaryFilter,
      label: 'Vehicle',
      value: vehicleCount,
      icon: CarFront,
      className: 'summary-vehicle',
    },
    {
      filter: 'IoT Device' as SummaryFilter,
      label: 'IoT Device',
      value: iotCount,
      icon: Cpu,
      className: 'summary-iot',
    },
    {
      filter: 'Facility' as SummaryFilter,
      label: 'Facility',
      value: facilityCount,
      icon: Building2,
      className: 'summary-facility',
    },
  ]

  return (
    <section className="entity-summary" aria-label="Ringkasan entitas">
      {summaryCards.map((card) => {
        const Icon = card.icon
        const isSelected = selectedFilter === card.filter

        return (
          <button
            key={card.filter}
            type="button"
            className={`summary-card ${card.className} ${
              isSelected ? 'summary-selected' : ''
            }`}
            onClick={() => onFilterChange(card.filter)}
            aria-pressed={isSelected}
          >
            <div className="summary-card-top">
              <p>{card.label}</p>

              <span className="summary-card-icon" aria-hidden="true">
                <Icon size={22} strokeWidth={2} />
              </span>
            </div>

            <h2>{card.value}</h2>

            <span className="summary-card-footer">
              {isSelected ? 'Filter aktif' : 'Klik untuk filter'}
            </span>
          </button>
        )
      })}
    </section>
  )
}

export default EntitySummary