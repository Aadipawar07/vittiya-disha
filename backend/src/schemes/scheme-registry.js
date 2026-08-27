import { nbcfdcSchemes } from './nbcfdc/index.js'
import { nsfdcSchemes } from './nsfdc/index.js'
import { nskfdcSchemes } from './nskfdc/index.js'

export const schemeRegistry = [...nbcfdcSchemes, ...nsfdcSchemes, ...nskfdcSchemes]
