/**
 * LocalStorage service for managing onboarding submissions
 * In a production app, this would be replaced with API calls
 */

const STORAGE_KEY = 'onboardiq_submissions'

export const saveSubmission = (submission) => {
  try {
    const submissions = getSubmissions()
    const newSubmission = {
      ...submission,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    submissions.push(newSubmission)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
    return newSubmission
  } catch (error) {
    console.error('Error saving submission:', error)
    throw error
  }
}

export const getSubmissions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading submissions:', error)
    return []
  }
}

export const getSubmissionById = (id) => {
  const submissions = getSubmissions()
  return submissions.find(sub => sub.id === id)
}

export const updateSubmission = (id, updates) => {
  try {
    const submissions = getSubmissions()
    const index = submissions.findIndex(sub => sub.id === id)
    
    if (index === -1) {
      throw new Error('Submission not found')
    }
    
    // Handle nested updates (e.g., 'riskAssessment.status')
    const updatedSubmission = { ...submissions[index] }
    Object.keys(updates).forEach(key => {
      if (key.includes('.')) {
        const keys = key.split('.')
        let obj = updatedSubmission
        for (let i = 0; i < keys.length - 1; i++) {
          if (!obj[keys[i]]) obj[keys[i]] = {}
          obj = obj[keys[i]]
        }
        obj[keys[keys.length - 1]] = updates[key]
      } else {
        updatedSubmission[key] = updates[key]
      }
    })
    
    updatedSubmission.updatedAt = new Date().toISOString()
    submissions[index] = updatedSubmission
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
    return submissions[index]
  } catch (error) {
    console.error('Error updating submission:', error)
    throw error
  }
}

export const deleteSubmission = (id) => {
  try {
    const submissions = getSubmissions()
    const filtered = submissions.filter(sub => sub.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error deleting submission:', error)
    return false
  }
}

export const getSubmissionsByStatus = (status) => {
  const submissions = getSubmissions()
  return submissions.filter(sub => sub.riskAssessment?.status === status)
}

export const getStatistics = () => {
  const submissions = getSubmissions()
  
  const stats = {
    total: submissions.length,
    byStatus: {
      approved: 0,
      review: 0,
      flagged: 0,
    },
    byEntityType: {
      vendor: 0,
      client: 0,
    },
    byRiskLevel: {
      low: 0,
      medium: 0,
      high: 0,
    },
    averageRiskScore: 0,
  }
  
  let totalRiskScore = 0
  
  submissions.forEach(sub => {
    const status = sub.riskAssessment?.status || 'review'
    const riskLevel = sub.riskAssessment?.level || 'medium'
    const riskScore = sub.riskAssessment?.score || 0
    
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1
    stats.byEntityType[sub.entityType] = (stats.byEntityType[sub.entityType] || 0) + 1
    stats.byRiskLevel[riskLevel] = (stats.byRiskLevel[riskLevel] || 0) + 1
    totalRiskScore += riskScore
  })
  
  stats.averageRiskScore = submissions.length > 0 
    ? Math.round(totalRiskScore / submissions.length) 
    : 0
  
  return stats
}

