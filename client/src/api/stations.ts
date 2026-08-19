import { apiGet } from './client'
import type { Station, StationHistoryResponse, UtilisationResponse } from '@/types/station'

export function fetchStations(): Promise<Station[]> {
  return apiGet<Station[]>('/api/stations')
}

export function fetchStationHistory(id: string, hours: number): Promise<StationHistoryResponse> {
  return apiGet<StationHistoryResponse>(`/api/stations/${id}/history?hours=${hours}`)
}

export function fetchUtilisation(hours: number): Promise<UtilisationResponse> {
  return apiGet<UtilisationResponse>(`/api/utilisation?hours=${hours}`)
}
