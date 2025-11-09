import { useState, useEffect } from 'react'
import { getSubmissions, getStatistics, updateSubmission, deleteSubmission } from '../services/storage'

const Dashboard = () => {
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all') // all, approved, review, flagged
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, risk-high, risk-low
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allSubmissions = getSubmissions()
    setSubmissions(allSubmissions)
    setStats(getStatistics())
  }

  const handleStatusChange = (id, newStatus) => {
    const submission = submissions.find(s => s.id === id)
    if (submission) {
      updateSubmission(id, {
        riskAssessment: {
          ...submission.riskAssessment,
          status: newStatus,
        },
      })
      loadData()
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      deleteSubmission(id)
      loadData()
      setSelectedSubmission(null)
    }
  }

  const getFilteredSubmissions = () => {
    let filtered = [...submissions]

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(
        (sub) => sub.riskAssessment?.status === filter
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'risk-high':
          return (b.riskAssessment?.score || 0) - (a.riskAssessment?.score || 0)
        case 'risk-low':
          return (a.riskAssessment?.score || 0) - (b.riskAssessment?.score || 0)
        default:
          return 0
      }
    })

    return filtered
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'flagged':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-slate-600'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredSubmissions = getFilteredSubmissions()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Audit Dashboard</h1>
        <p className="text-slate-600">Monitor onboarding progress, risk scores, and submissions</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Submissions</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.byStatus.approved}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Under Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.byStatus.review}</p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Flagged</p>
                <p className="text-3xl font-bold text-red-600">{stats.byStatus.flagged}</p>
              </div>
              <div className="text-4xl">🚩</div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6">
            <p className="text-sm text-slate-600 mb-2">Average Risk Score</p>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-slate-800">{stats.averageRiskScore}</div>
              <div className="text-sm text-slate-500">/ 100</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6">
            <p className="text-sm text-slate-600 mb-2">Vendors</p>
            <div className="text-3xl font-bold text-slate-800">{stats.byEntityType.vendor || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl shadow-lg p-6">
            <p className="text-sm text-slate-600 mb-2">Clients</p>
            <div className="text-3xl font-bold text-slate-800">{stats.byEntityType.client || 0}</div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Filter by Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="review">Under Review</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="risk-high">Highest Risk</option>
              <option value="risk-low">Lowest Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-slate-400">
                      <div className="text-5xl mb-4">📭</div>
                      <p className="text-lg font-medium">No submissions found</p>
                      <p className="text-sm mt-2">
                        {filter === 'all'
                          ? 'Submit your first onboarding request to get started!'
                          : `No submissions with status "${filter}"`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {submission.entityType === 'vendor' ? '🏢' : '👥'}
                        </span>
                        <span className="text-sm font-medium text-slate-800 capitalize">
                          {submission.entityType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {submission.companyName}
                        </div>
                        <div className="text-xs text-slate-500">{submission.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 w-24">
                          <div
                            className={`h-2 rounded-full ${
                              submission.riskAssessment?.level === 'high'
                                ? 'bg-red-500'
                                : submission.riskAssessment?.level === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${submission.riskAssessment?.score || 0}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-semibold ${getRiskColor(
                            submission.riskAssessment?.level
                          )}`}
                        >
                          {submission.riskAssessment?.score || 0}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={submission.riskAssessment?.status || 'review'}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleStatusChange(submission.id, e.target.value)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          submission.riskAssessment?.status || 'review'
                        )} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="approved">Approved</option>
                        <option value="review">Review</option>
                        <option value="flagged">Flagged</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(submission.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedSubmission(submission)
                          }}
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(submission.id)
                          }}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Submission Details
              </h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-white hover:text-slate-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Risk Assessment</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Score</span>
                      <span className={`text-2xl font-bold ${getRiskColor(selectedSubmission.riskAssessment?.level)}`}>
                        {selectedSubmission.riskAssessment?.score || 0}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full ${
                          selectedSubmission.riskAssessment?.level === 'high'
                            ? 'bg-red-500'
                            : selectedSubmission.riskAssessment?.level === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${selectedSubmission.riskAssessment?.score || 0}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedSubmission.riskAssessment?.status)}`}>
                        {selectedSubmission.riskAssessment?.status?.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">
                        {selectedSubmission.riskAssessment?.level?.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Entity Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-xs text-slate-500">Type:</span>
                      <span className="ml-2 text-sm font-medium text-slate-800 capitalize">
                        {selectedSubmission.entityType}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Company:</span>
                      <span className="ml-2 text-sm font-medium text-slate-800">
                        {selectedSubmission.companyName}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Industry:</span>
                      <span className="ml-2 text-sm font-medium text-slate-800">
                        {selectedSubmission.industry}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">Contact Information</h3>
                <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Contact:</span>
                    <p className="text-sm font-medium text-slate-800">{selectedSubmission.contactName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Email:</span>
                    <p className="text-sm font-medium text-slate-800">{selectedSubmission.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Phone:</span>
                    <p className="text-sm font-medium text-slate-800">{selectedSubmission.phone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Tax ID:</span>
                    <p className="text-sm font-medium text-slate-800">{selectedSubmission.taxId}</p>
                  </div>
                </div>
              </div>

              {selectedSubmission.riskAssessment?.factors && selectedSubmission.riskAssessment.factors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-600 mb-3">Risk Factors</h3>
                  <div className="space-y-2">
                    {selectedSubmission.riskAssessment.factors.map((factor, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-l-4 ${
                          factor.severity === 'high'
                            ? 'bg-red-50 border-red-400'
                            : factor.severity === 'medium'
                            ? 'bg-yellow-50 border-yellow-400'
                            : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-700 capitalize">
                            {factor.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            factor.severity === 'high'
                              ? 'bg-red-100 text-red-700'
                              : factor.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {factor.severity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{factor.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubmission.duplicates && selectedSubmission.duplicates.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-red-600 mb-3">⚠️ Duplicate Warnings</h3>
                  <div className="bg-red-50 rounded-lg p-4 space-y-2">
                    {selectedSubmission.duplicates.map((dup, idx) => (
                      <p key={idx} className="text-sm text-red-700">{dup.message}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
