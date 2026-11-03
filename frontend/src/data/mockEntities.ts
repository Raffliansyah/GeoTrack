import type { Entity } from '../types/entity'

export const mockEntities: Entity[] = [
  {
    id: 1,
    name: 'Kendaraan Operasional A',
    type: 'Vehicle',
    status: 'Active',
    latitude: -6.2088,
    longitude: 106.8456,
  },
  {
    id: 2,
    name: 'Sensor IoT Jakarta Selatan',
    type: 'IoT Device',
    status: 'Active',
    latitude: -6.2615,
    longitude: 106.8106,
  },
  {
    id: 3,
    name: 'Fasilitas Gudang Jakarta',
    type: 'Facility',
    status: 'Inactive',
    latitude: -6.1754,
    longitude: 106.8272,
  },
]