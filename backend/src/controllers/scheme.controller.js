import { createRecommendation } from '../services/recommendation.service.js'
import { SchemeRepository } from '../repositories/scheme.repository.js'

const repository = new SchemeRepository()
export async function recommend(request, response, next) {
  try { response.json({ success: true, data: await createRecommendation(request.body, repository) }) } catch (error) { next(error) }
}
