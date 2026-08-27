import { ChannelPartnerRepository } from './lender-repository.js'
export function eligibleLenders({ district, schemeId, beneficiaryRate, repository = new ChannelPartnerRepository() }) {
  return repository.getEligibleLenders(district, schemeId).map((partner) => ({ partnerName: partner.partnerName, partnerType: partner.partnerType, beneficiaryRate: beneficiaryRate ?? null, processingFee: null, docCharges: null, prepaymentPenalty: null, otherMiscCharges: null, branchAddress: partner.branches[0]?.address, contactPoint: partner.branches[0]?.contactPoint, distanceKm: null, lastVerifiedDate: partner.lastVerifiedDate, verificationSource: partner.verificationSource, confidence: partner.confidence })).sort((a, b) => (a.beneficiaryRate ?? Infinity) - (b.beneficiaryRate ?? Infinity))
}
