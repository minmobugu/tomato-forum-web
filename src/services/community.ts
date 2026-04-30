import { apiCommunityService } from './community/api'
import { mockCommunityService } from './community/mock'

function resolveCommunityService() {
  return import.meta.env.VITE_COMMUNITY_DATA_SOURCE === 'api'
    ? apiCommunityService
    : mockCommunityService
}

export const communityService = resolveCommunityService()
