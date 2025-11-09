import { useState, useEffect } from 'react'
import { calculateRiskScore, checkDuplicates } from '../utils/riskScoring'
import { saveSubmission, getSubmissions } from '../services/storage'

const OnboardingForm = () => {
  const [formData, setFormData] = useState({
    entityType: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    industry: '',
    annualRevenue: '',
    employeeCount: '',
    website: '',
    businessType: '',
    // Vendor-specific fields
    serviceType: '',
    contractValue: '',
    complianceCertifications: [],
    // Client-specific fields
    clientTier: '',
    expectedVolume: '',
    paymentTerms: '',
    // Security fields
    hasEncryption: '',
    hasAccessControl: '',
    hasLogging: '',
    hasNetworkSecurity: '',
    // Additional fields
    description: '',
    documents: null,
  })

  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [riskAssessment, setRiskAssessment] = useState(null)
  const [duplicateWarnings, setDuplicateWarnings] = useState([])

  const entityTypes = [
    { value: 'vendor', label: 'Vendor', icon: '🏢' },
    { value: 'client', label: 'Client', icon: '👥' },
  ]

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Other',
  ]

  const serviceTypes = [
    'Software Development',
    'Cloud Services',
    'IT Support',
    'Consulting',
    'Marketing',
    'Legal Services',
    'Other',
  ]

  const clientTiers = ['Enterprise', 'Mid-Market', 'SMB', 'Startup']

  const complianceOptions = [
    'SOC 2',
    'ISO 27001',
    'GDPR',
    'HIPAA',
    'PCI DSS',
    'NIST',
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      const currentCerts = formData.complianceCertifications || []
      if (checked) {
        setFormData({
          ...formData,
          complianceCertifications: [...currentCerts, value],
        })
      } else {
        setFormData({
          ...formData,
          complianceCertifications: currentCerts.filter((c) => c !== value),
        })
      }
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: e.target.files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
    
  }
  
  useEffect(() => {
    // Calculate risk score when form data changes (only if entity type is selected)
    if (formData.entityType) {
      const assessment = calculateRiskScore(formData)
      setRiskAssessment(assessment)
      
      // Check for duplicates
      const existingSubmissions = getSubmissions()
      const duplicates = checkDuplicates(formData, existingSubmissions)
      setDuplicateWarnings(duplicates)
    }
  }, [formData])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.entityType) {
      newErrors.entityType = 'Please select an entity type'
    }
    if (!formData.companyName) {
      newErrors.companyName = 'Company name is required'
    }
    if (!formData.contactName) {
      newErrors.contactName = 'Contact name is required'
    }
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.taxId) {
      newErrors.taxId = 'Tax ID is required'
    }
    if (!formData.address) {
      newErrors.address = 'Address is required'
    }
    if (!formData.city) {
      newErrors.city = 'City is required'
    }
    if (!formData.country) {
      newErrors.country = 'Country is required'
    }
    if (!formData.industry) {
      newErrors.industry = 'Industry is required'
    }

    // Vendor-specific validations
    if (formData.entityType === 'vendor' && !formData.serviceType) {
      newErrors.serviceType = 'Service type is required for vendors'
    }

    // Client-specific validations
    if (formData.entityType === 'client' && !formData.clientTier) {
      newErrors.clientTier = 'Client tier is required for clients'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      try {
        // Calculate final risk assessment
        const finalAssessment = calculateRiskScore(formData)
        
        // Check for duplicates one more time
        const existingSubmissions = getSubmissions()
        const duplicates = checkDuplicates(formData, existingSubmissions)
        
        // Prepare submission data
        const submissionData = {
          ...formData,
          riskAssessment: finalAssessment,
          duplicates: duplicates,
        }
        
        // Save submission
        const savedSubmission = saveSubmission(submissionData)
        
        console.log('Submission saved:', savedSubmission)
        setSubmitted(true)
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setSubmitted(false)
          setRiskAssessment(null)
          setDuplicateWarnings([])
          setFormData({
            entityType: '',
            companyName: '',
            contactName: '',
            email: '',
            phone: '',
            taxId: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
            industry: '',
            annualRevenue: '',
            employeeCount: '',
            website: '',
            businessType: '',
            serviceType: '',
            contractValue: '',
            complianceCertifications: [],
            clientTier: '',
            expectedVolume: '',
            paymentTerms: '',
            hasEncryption: '',
            hasAccessControl: '',
            hasLogging: '',
            hasNetworkSecurity: '',
            description: '',
            documents: null,
          })
        }, 3000)
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('An error occurred while submitting. Please try again.')
      }
    }
  }

  const InputField = ({ label, name, type = 'text', required = false, options = null, ...props }) => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {type === 'select' ? (
          <select
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
              errors[name] ? 'border-red-500' : 'border-slate-300'
            }`}
            {...props}
          >
            <option value="">Select {label}</option>
            {options?.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none ${
              errors[name] ? 'border-red-500' : 'border-slate-300'
            }`}
            {...props}
          />
        ) : type === 'file' ? (
          <input
            type="file"
            name={name}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
              errors[name] ? 'border-red-500' : 'border-slate-300'
            }`}
            {...props}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
              errors[name] ? 'border-red-500' : 'border-slate-300'
            }`}
            {...props}
          />
        )}
        {errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
        )}
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Submission Successful!
          </h2>
          <p className="text-slate-600">
            Your onboarding request has been submitted and is being processed.
            You will receive a confirmation email shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Onboarding Request
          </h1>
          <p className="text-blue-100">
            Please fill out the form below to begin the onboarding process
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Risk Score Indicator */}
          {riskAssessment && formData.entityType && (
            <div className="mb-8 p-4 rounded-lg border-2 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700">Real-time Risk Assessment</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  riskAssessment.level === 'high' 
                    ? 'bg-red-100 text-red-700' 
                    : riskAssessment.level === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {riskAssessment.level.toUpperCase()} RISK
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">Risk Score</span>
                    <span className="text-lg font-bold text-slate-800">{riskAssessment.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        riskAssessment.level === 'high'
                          ? 'bg-red-500'
                          : riskAssessment.level === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${riskAssessment.score}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Status</div>
                  <div className={`text-sm font-semibold ${
                    riskAssessment.status === 'approved' ? 'text-green-600' :
                    riskAssessment.status === 'review' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {riskAssessment.status === 'approved' ? '✓ Auto-Approve' :
                     riskAssessment.status === 'review' ? '⚠ Needs Review' :
                     '🚩 Flagged'}
                  </div>
                </div>
              </div>
              {duplicateWarnings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500">⚠️</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-red-700 mb-1">Duplicate Detection:</p>
                      {duplicateWarnings.map((dup, idx) => (
                        <p key={idx} className="text-xs text-red-600">{dup.message}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Entity Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-4">
              Entity Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {entityTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, entityType: type.value })
                    setErrors({ ...errors, entityType: '' })
                  }}
                  className={`p-6 border-2 rounded-lg transition-all text-left ${
                    formData.entityType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-semibold text-slate-800">{type.label}</div>
                </button>
              ))}
            </div>
            {errors.entityType && (
              <p className="mt-2 text-sm text-red-600">{errors.entityType}</p>
            )}
          </div>

          {formData.entityType && (
            <>
              {/* Basic Information */}
              <div className="border-t border-slate-200 pt-8 mb-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Company Name"
                    name="companyName"
                    required
                    placeholder="Enter company name"
                  />
                  <InputField
                    label="Contact Name"
                    name="contactName"
                    required
                    placeholder="Enter contact person name"
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    placeholder="contact@company.com"
                  />
                  <InputField
                    label="Phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+1 (555) 123-4567"
                  />
                  <InputField
                    label="Tax ID / EIN"
                    name="taxId"
                    required
                    placeholder="12-3456789"
                  />
                  <InputField
                    label="Website"
                    name="website"
                    type="url"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="border-t border-slate-200 pt-8 mb-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Address Information
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <InputField
                    label="Street Address"
                    name="address"
                    required
                    placeholder="123 Main Street"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField
                      label="City"
                      name="city"
                      required
                      placeholder="City"
                    />
                    <InputField
                      label="State / Province"
                      name="state"
                      placeholder="State"
                    />
                    <InputField
                      label="ZIP / Postal Code"
                      name="zipCode"
                      placeholder="12345"
                    />
                  </div>
                  <InputField
                    label="Country"
                    name="country"
                    required
                    placeholder="United States"
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="border-t border-slate-200 pt-8 mb-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Business Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Industry"
                    name="industry"
                    type="select"
                    required
                    options={industries}
                  />
                  <InputField
                    label="Annual Revenue"
                    name="annualRevenue"
                    type="select"
                    options={[
                      'Less than $1M',
                      '$1M - $10M',
                      '$10M - $50M',
                      '$50M - $100M',
                      'More than $100M',
                    ]}
                  />
                  <InputField
                    label="Employee Count"
                    name="employeeCount"
                    type="select"
                    options={[
                      '1-10',
                      '11-50',
                      '51-200',
                      '201-500',
                      '501-1000',
                      'More than 1000',
                    ]}
                  />
                  <InputField
                    label="Business Type"
                    name="businessType"
                    type="select"
                    options={['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship', 'Other']}
                  />
                </div>
              </div>

              {/* Entity-Specific Fields */}
              {formData.entityType === 'vendor' && (
                <div className="border-t border-slate-200 pt-8 mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    Vendor-Specific Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Service Type"
                      name="serviceType"
                      type="select"
                      required
                      options={serviceTypes}
                    />
                    <InputField
                      label="Contract Value"
                      name="contractValue"
                      type="select"
                      options={[
                        'Less than $10K',
                        '$10K - $50K',
                        '$50K - $100K',
                        '$100K - $500K',
                        'More than $500K',
                      ]}
                    />
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Compliance Certifications
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {complianceOptions.map((cert) => (
                        <label
                          key={cert}
                          className="flex items-center p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            value={cert}
                            checked={formData.complianceCertifications?.includes(cert)}
                            onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <span className="text-sm text-slate-700">{cert}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {formData.entityType === 'client' && (
                <div className="border-t border-slate-200 pt-8 mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    Client-Specific Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Client Tier"
                      name="clientTier"
                      type="select"
                      required
                      options={clientTiers}
                    />
                    <InputField
                      label="Expected Volume"
                      name="expectedVolume"
                      type="select"
                      options={[
                        'Low (< 100 transactions/month)',
                        'Medium (100-1000 transactions/month)',
                        'High (1000-10000 transactions/month)',
                        'Very High (> 10000 transactions/month)',
                      ]}
                    />
                    <InputField
                      label="Payment Terms"
                      name="paymentTerms"
                      type="select"
                      options={['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt']}
                    />
                  </div>
                </div>
              )}

              {/* Security Assessment */}
              <div className="border-t border-slate-200 pt-8 mb-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Security Assessment
                </h2>
                <p className="text-sm text-slate-600 mb-6">
                  Please indicate which security controls your organization has in place:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Data Encryption"
                    name="hasEncryption"
                    type="select"
                    options={['Yes', 'No', 'Partial']}
                  />
                  <InputField
                    label="Access Control / IAM"
                    name="hasAccessControl"
                    type="select"
                    options={['Yes', 'No', 'Partial']}
                  />
                  <InputField
                    label="Logging & Monitoring"
                    name="hasLogging"
                    type="select"
                    options={['Yes', 'No', 'Partial']}
                  />
                  <InputField
                    label="Network Security"
                    name="hasNetworkSecurity"
                    type="select"
                    options={['Yes', 'No', 'Partial']}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t border-slate-200 pt-8 mb-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Additional Information
                </h2>
                <InputField
                  label="Description"
                  name="description"
                  type="textarea"
                  placeholder="Please provide any additional information about your organization..."
                />
                <InputField
                  label="Supporting Documents"
                  name="documents"
                  type="file"
                />
              </div>

              {/* Submit Button */}
              <div className="border-t border-slate-200 pt-8">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3.5 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
                >
                  Submit Onboarding Request
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default OnboardingForm

