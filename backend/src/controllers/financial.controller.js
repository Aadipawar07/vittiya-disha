import { calculateFinancial, estimateFinancial, getSchemeFinancialConfiguration } from '../services/financial.service.js'
export function calculate(request, response, next) { try { response.json({ success: true, data: calculateFinancial(request.body) }) } catch (error) { next(error) } }
export function estimate(request, response, next) { try { response.json({ success: true, data: estimateFinancial(request.body) }) } catch (error) { next(error) } }
export function configuration(request, response, next) { try { response.json({ success: true, data: getSchemeFinancialConfiguration(request.params.schemeId) }) } catch (error) { next(error) } }
