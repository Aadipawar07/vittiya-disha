import { schemeRegistry } from '../schemes/scheme-registry.js'

export class SchemeRepository {
  getAllSchemes() { return schemeRegistry }
  getSchemeByCode(code) { return schemeRegistry.find((scheme) => scheme.scheme_code === code) }
  getSchemesByCorporation(corporation) { return schemeRegistry.filter((scheme) => scheme.corporation === corporation) }
  getActiveSchemes(corporation) { return this.getSchemesByCorporation(corporation).filter((scheme) => scheme.active) }
}
