export function evaluateRules(user, rules = []) {
  return rules.map((rule) => {
    const actual = rule.getActual(user)
    const unknown = actual === undefined || actual === null || actual === ''
    let result = unknown ? 'UNKNOWN' : rule.test(actual, user) ? 'PASS' : 'FAIL'
    return { rule: rule.id, expected: rule.expected, operator: rule.operator, threshold: rule.threshold, actual, result, rule_id: rule.id }
  })
}

export function statusFromRules(rules) {
  if (rules.some((rule) => rule.result === 'FAIL')) return 'NOT_ELIGIBLE'
  if (rules.some((rule) => rule.result === 'UNKNOWN')) return 'NEEDS_VERIFICATION'
  return 'ELIGIBLE'
}
