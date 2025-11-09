/**
 * Risk Scoring Algorithm
 * Calculates risk score based on various factors from onboarding data
 * Score range: 0-100 (0 = low risk, 100 = high risk)
 */

export const calculateRiskScore = (formData) => {
  let riskScore = 0
  const riskFactors = []

  // 1. Missing Information (0-20 points)
  const requiredFields = [
    'companyName',
    'contactName',
    'email',
    'phone',
    'taxId',
    'address',
    'city',
    'country',
    'industry',
  ]
  
  const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '')
  const missingFieldScore = (missingFields.length / requiredFields.length) * 20
  riskScore += missingFieldScore
  
  if (missingFields.length > 0) {
    riskFactors.push({
      type: 'missing_fields',
      severity: missingFields.length > 3 ? 'high' : 'medium',
      message: `Missing ${missingFields.length} required field(s)`,
      fields: missingFields,
    })
  }

  // 2. Entity-Specific Missing Fields (0-10 points)
  if (formData.entityType === 'vendor' && !formData.serviceType) {
    riskScore += 5
    riskFactors.push({
      type: 'vendor_specific',
      severity: 'medium',
      message: 'Vendor service type not specified',
    })
  }
  
  if (formData.entityType === 'client' && !formData.clientTier) {
    riskScore += 5
    riskFactors.push({
      type: 'client_specific',
      severity: 'medium',
      message: 'Client tier not specified',
    })
  }

  // 3. Security Controls Assessment (0-30 points)
  const securityControls = [
    { field: 'hasEncryption', weight: 7.5 },
    { field: 'hasAccessControl', weight: 7.5 },
    { field: 'hasLogging', weight: 7.5 },
    { field: 'hasNetworkSecurity', weight: 7.5 },
  ]

  let securityRisk = 0
  securityControls.forEach(control => {
    const value = formData[control.field]
    if (value === 'No') {
      securityRisk += control.weight
      riskFactors.push({
        type: 'security',
        severity: 'high',
        message: `Missing ${control.field.replace('has', '').replace(/([A-Z])/g, ' $1').trim()} control`,
      })
    } else if (value === 'Partial') {
      securityRisk += control.weight * 0.5
    }
  })
  riskScore += securityRisk

  // 4. Compliance Certifications (0-15 points)
  if (formData.entityType === 'vendor') {
    const complianceCount = formData.complianceCertifications?.length || 0
    if (complianceCount === 0) {
      riskScore += 15
      riskFactors.push({
        type: 'compliance',
        severity: 'high',
        message: 'No compliance certifications provided',
      })
    } else if (complianceCount < 2) {
      riskScore += 7.5
      riskFactors.push({
        type: 'compliance',
        severity: 'medium',
        message: 'Limited compliance certifications',
      })
    }
  }

  // 5. Business Information Completeness (0-10 points)
  const businessFields = ['annualRevenue', 'employeeCount', 'businessType', 'website']
  const missingBusinessFields = businessFields.filter(field => !formData[field])
  const businessRisk = (missingBusinessFields.length / businessFields.length) * 10
  riskScore += businessRisk

  if (missingBusinessFields.length > 2) {
    riskFactors.push({
      type: 'business_info',
      severity: 'medium',
      message: 'Incomplete business information',
    })
  }

  // 6. Email Domain Validation (0-5 points)
  if (formData.email) {
    const emailDomain = formData.email.split('@')[1]
    const suspiciousDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com']
    if (suspiciousDomains.some(domain => emailDomain?.includes(domain))) {
      riskScore += 5
      riskFactors.push({
        type: 'fraud',
        severity: 'high',
        message: 'Suspicious email domain detected',
      })
    }
  }

  // 7. Tax ID Format Validation (0-5 points)
  if (formData.taxId) {
    const taxIdPattern = /^[\d-]+$/
    if (!taxIdPattern.test(formData.taxId.replace(/\s/g, ''))) {
      riskScore += 5
      riskFactors.push({
        type: 'validation',
        severity: 'medium',
        message: 'Tax ID format appears invalid',
      })
    }
  }

  // 8. Website Validation (0-5 points)
  if (formData.website && !formData.website.startsWith('http')) {
    riskScore += 2
  }

  // Cap the score at 100
  riskScore = Math.min(100, Math.round(riskScore))

  // Determine risk level
  let riskLevel = 'low'
  if (riskScore >= 70) {
    riskLevel = 'high'
  } else if (riskScore >= 40) {
    riskLevel = 'medium'
  }

  // Determine status based on risk
  let status = 'approved'
  if (riskScore >= 70) {
    status = 'flagged'
  } else if (riskScore >= 40) {
    status = 'review'
  }

  return {
    score: riskScore,
    level: riskLevel,
    status,
    factors: riskFactors,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Check for duplicate submissions
 */
export const checkDuplicates = (formData, existingSubmissions) => {
  const duplicates = []
  
  existingSubmissions.forEach(sub => {
    // Check for same email
    if (sub.email?.toLowerCase() === formData.email?.toLowerCase() && sub.id) {
      duplicates.push({
        type: 'email',
        existingId: sub.id,
        message: 'Email already exists in system',
      })
    }
    
    // Check for same tax ID
    if (sub.taxId?.replace(/\D/g, '') === formData.taxId?.replace(/\D/g, '') && sub.id) {
      duplicates.push({
        type: 'taxId',
        existingId: sub.id,
        message: 'Tax ID already exists in system',
      })
    }
  })
  
  return duplicates
}

