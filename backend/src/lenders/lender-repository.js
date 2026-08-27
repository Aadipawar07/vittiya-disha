const channelPartners = [
  { id: 'partner-sbi-jalgaon', partnerName: 'State Bank of India - Jalgaon', partnerType: 'PSU_BANK', corporationIds: ['NBCFDC', 'NSFDC', 'NSKFDC'], schemeIds: ['NBCFDC_INDIVIDUAL', 'NSFDC_MICRO_FINANCE', 'NSFDC_TERM_LOAN'], states: ['Maharashtra'], districts: ['Jalgaon'], branches: [{ address: 'Jalgaon Main Branch', contactPoint: 'Contact branch' }], verificationSource: 'Admin directory', lastVerifiedDate: '2026-08-01', confidence: 'HIGH' },
  { id: 'partner-canara-nashik', partnerName: 'Canara Bank - Nashik', partnerType: 'PSU_BANK', corporationIds: ['NSFDC'], schemeIds: ['NSFDC_EDUCATION', 'NSFDC_UDYAM_NIDHI'], states: ['Maharashtra'], districts: ['Nashik'], branches: [{ address: 'Nashik Branch', contactPoint: 'Contact branch' }], verificationSource: 'Admin directory', lastVerifiedDate: '2026-08-01', confidence: 'HIGH' }
]
export class ChannelPartnerRepository {
  getByDistrict(district) { return channelPartners.filter((partner) => partner.districts.includes(district)) }
  getByScheme(schemeId) { return channelPartners.filter((partner) => partner.schemeIds.includes(schemeId)) }
  getEligibleLenders(district, schemeId) { return this.getByDistrict(district).filter((partner) => partner.schemeIds.includes(schemeId)) }
  getByPartnerId(id) { return channelPartners.find((partner) => partner.id === id) }
}
