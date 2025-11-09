# OnboardIQ - Secure & Intelligent Onboarding Hub

A comprehensive platform that automates and secures the entire lifecycle of vendor and client onboarding, integrating control requirements and advanced fraud detection capabilities.

## Features

- **Dynamic Onboarding Forms**: Vendor and client-specific forms that adapt based on entity type
- **Professional UI**: Modern, responsive design built with React and Tailwind CSS
- **Form Validation**: Comprehensive client-side validation with error handling
- **Security Assessment**: Built-in security control requirements evaluation
- **Compliance Tracking**: Support for various compliance certifications (SOC 2, ISO 27001, GDPR, HIPAA, etc.)

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── OnboardingForm.jsx    # Main onboarding form component
│   └── Dashboard.jsx          # Audit dashboard (coming soon)
├── App.jsx                     # Main app component with routing
├── main.jsx                    # Entry point
└── index.css                   # Global styles with Tailwind
```

## Features in Development

- [ ] Risk Scoring & Fraud Detection
- [ ] PII Detection & Masking
- [ ] Automated Workflow Engine
- [ ] Approval Workflow
- [ ] Real-time Audit Dashboard
- [ ] AI-powered form suggestions

## License

MIT
