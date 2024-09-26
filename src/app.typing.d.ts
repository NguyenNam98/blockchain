interface TMetaData {
  ipAddress: string
  userAgent: string
  userId?: number
  userName?: string
  referer: string
}

interface TBaseDto<T> {
  data: T
  error?: string
  message?: string
}

interface TAuPayload {
  userId: number
  userName: string
}



export { TMetaData, TBaseDto, TAuPayload }