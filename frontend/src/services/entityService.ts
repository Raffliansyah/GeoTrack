import type { Entity } from '../types/entity'

const API_BASE_URL = '/api'

export async function getEntities(): Promise<Entity[]> {
  const response = await fetch(`${API_BASE_URL}/entities`)

  if (!response.ok) {
    throw new Error('Gagal mengambil data entitas dari backend')
  }

  const data: Entity[] = await response.json()

  return data
}

export async function createEntity(
  entity: Omit<Entity, 'id'>
): Promise<Entity> {
  const response = await fetch(`${API_BASE_URL}/entities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entity),
  })

  if (!response.ok) {
    throw new Error('Gagal menambahkan entitas ke backend')
  }

  const createdEntity: Entity = await response.json()

  return createdEntity
}

export async function updateEntity(
  entity: Entity
): Promise<Entity> {
  const response = await fetch(
    `${API_BASE_URL}/entities/${entity.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    }
  )

  if (!response.ok) {
    throw new Error(
      `Gagal memperbarui entitas. HTTP ${response.status}`
    )
  }

  const updatedEntity: Entity = await response.json()

  return updatedEntity
}

export async function deleteEntity(id: number): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/entities/${id}`,
    {
      method: 'DELETE',
    }
  )

  if (!response.ok) {
    throw new Error(
      `Gagal menghapus entitas. HTTP ${response.status}`
    )
  }
}