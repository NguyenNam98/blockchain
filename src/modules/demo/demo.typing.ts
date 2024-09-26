export interface TDemo {
  p: any
  c: any
}

export interface TDemoPaging {
  id: number
  title: string | null
  statusType: number
  priority: number
  limit?: number | null
  noOfSold?: number
}
