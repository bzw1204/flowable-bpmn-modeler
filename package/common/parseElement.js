import { parseCDATA } from './util'

export function commonParse(element) {
  let result = {
    ...element.businessObject,
    ...element.businessObject.$attrs
  }
  // 移除flowable前缀，格式化数组
  for (const key in result) {
    if (key.indexOf('flowable:') === 0) {
      const newKey = key.replace('flowable:', '')
      result[newKey] = result[key]
      delete result[key]
    }
  }
  result = documentationParse(result)
  result.color = result.color ?? '#000'
  result.fixed = result.candidateGroups && typeof result.candidateGroups === 'string' && result.candidateGroups.includes('$')
  return result
}

export function documentationParse(obj) {
  if ('documentation' in obj) {
    let str = ''
    obj.documentation.forEach(item => {
      str += item.text
    })
    obj.documentation = str
  }
  return obj
}

export function conditionExpressionParse(obj) {
  if ('conditionExpression' in obj) {
    obj.conditionExpression = parseCDATA(obj.conditionExpression.body)
  }
  return obj
}

export function userTaskParse(obj) {
  for (const key in obj) {
    if (key === 'candidateUsers') {
      obj.userType = 'candidateUsers'
      obj[key] = obj[key]?.split(',') || []
    } else if (key === 'candidateGroups') {
      obj.userType = 'candidateGroups'
      if (!obj[key].includes('$')) {
        obj[key] = obj[key]?.split(',') || []
      }
    } else if (key === 'assignee') {
      obj.userType = 'assignee'
    }
  }
  return obj
}
