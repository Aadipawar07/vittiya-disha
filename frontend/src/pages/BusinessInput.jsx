import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StepIndicator from '../components/StepIndicator'
import { initialAssessment } from '../context/AssessmentContext'
import { useAssessment } from '../hooks/useAssessment'
import { submitAssessment } from '../services/api'

const corporations = [
  { id: 'NBCFDC', name: 'NBCFDC', description: 'National Backward Classes Finance & Development Corporation' },
  { id: 'NSFDC', name: 'NSFDC', description: 'National Scheduled Castes Finance & Development Corporation' },
  { id: 'NSKFDC', name: 'NSKFDC', description: 'National Safai Karamcharis Finance & Development Corporation' }
]

const purposeOptions = {
  NBCFDC: [
    { id: 'business', label: 'Start / Expand a Business' },
    { id: 'education', label: 'Education' },
    { id: 'group', label: 'Group / SHG Financing' }
  ],
  NSFDC: [
    { id: 'small_business', label: 'Small / Micro Business' },
    { id: 'micro_finance', label: 'Micro Finance' },
    { id: 'micro_finance_nbfc', label: 'Micro Finance through NBFC-MFI' },
    { id: 'large_income_generating_project', label: 'Large Income-Generating Project' },
    { id: 'education', label: 'Education' }
  ],
  NSKFDC: [
    { id: 'small_business', label: 'Small Business' },
    { id: 'women_business', label: 'Women-focused Business' },
    { id: 'micro_credit', label: 'Micro Credit' },
    { id: 'large_business', label: 'Large Business' },
    { id: 'education', label: 'Education' },
    { id: 'pay_use_toilet', label: 'Pay & Use Toilet Project' },
    { id: 'sanitary_mart', label: 'Sanitary Mart' },
    { id: 'green_business', label: 'Green Business' },
    { id: 'sanitation_enterprise', label: 'Sanitation Enterprise' },
    { id: 'skill_training', label: 'Skill Training' }
  ]
}

const states = ['Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal']
const occupations = ['Student', 'Farmer', 'Self-employed', 'Business owner', 'Salaried', 'Daily wage worker', 'Unemployed', 'Other']
const beneficiaryTypes = ['Safai Karamchari', 'Wastepicker', 'Manual Scavenger', 'Eligible Dependant']
const educationFields = [
  ['course_name', 'Course Name', 'text'], ['institution', 'College / Institution', 'text'],
  ['course_fee', 'Course Fee (INR)', 'number']
]

function cloneInitial() {
  return JSON.parse(JSON.stringify(initialAssessment))
}

function setNested(object, section, field, value) {
  return { ...object, [section]: { ...object[section], [field]: value } }
}

function money(value) {
  return value === '' || value === null || value === undefined ? 'Not provided' : `INR ${Number(value).toLocaleString('en-IN')}`
}

function Field({ label, name, value, onChange, type = 'text', options, required = false, error, placeholder }) {
  const id = `assessment-${name}`
  return (
    <label htmlFor={id} className="block text-sm font-semibold text-inkSoft">
      {label}{required && <span className="text-saffron"> *</span>}
      {options ? (
        <select id={id} name={name} value={value ?? ''} onChange={onChange} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="assessment-input mt-2">
          <option value="">Select an option</option>
          {options.map((option) => <option key={option.value || option} value={option.value || option}>{option.label || option}</option>)}
        </select>
      ) : (
        <input id={id} name={name} value={value ?? ''} onChange={onChange} type={type} min={type === 'number' ? 0 : undefined} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className="assessment-input mt-2" />
      )}
      {error && <span id={`${id}-error`} className="block mt-1 text-xs text-maroon">{error}</span>}
    </label>
  )
}

function ChoiceGrid({ options, value, onChange, columns = 'md:grid-cols-3' }) {
  return (
    <div className={`grid gap-4 ${columns}`} role="radiogroup">
      {options.map((option) => {
        const selected = value === option.id
        return (
          <button type="button" key={option.id} onClick={() => onChange(option.id)} role="radio" aria-checked={selected} className={`choice-card text-left ${selected ? 'choice-card-selected' : ''}`}>
            <span className="flex items-start justify-between gap-3"><strong className="font-display text-xl">{option.name || option.label}</strong><span className={`choice-dot ${selected ? 'choice-dot-selected' : ''}`} aria-hidden="true">{selected ? '✓' : ''}</span></span>
            {option.description && <span className="block mt-3 text-sm text-inkSoft leading-relaxed">{option.description}</span>}
          </button>
        )
      })}
    </div>
  )
}

function BusinessFields({ data, onChange, errors, large = false, sanitation = false }) {
  const hasLoans = data.existing_loans === true || data.existing_loans === 'true'
  return <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <Field label="Business type" name="type" value={data.type} onChange={onChange} placeholder="e.g. Dairy farming" required error={errors.type} />
      <Field label="Business status" name="status" value={data.status} onChange={onChange} options={['new', 'existing'].map((value) => ({ value, label: value === 'new' ? 'New Business' : 'Existing Business' }))} required error={errors.status} />
      <Field label="Project cost (INR)" name="project_cost" type="number" value={data.project_cost} onChange={onChange} required error={errors.project_cost} />
      <Field label="Required loan amount (INR)" name="loan_required" type="number" value={data.loan_required} onChange={onChange} required error={errors.loan_required} />
      <Field label="Own contribution (INR)" name="own_contribution" type="number" value={data.own_contribution} onChange={onChange} required error={errors.own_contribution} />
      <Field label="Existing loans" name="existing_loans" value={data.existing_loans === true ? 'true' : data.existing_loans === false ? 'false' : ''} onChange={onChange} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} required error={errors.existing_loans} />
      {hasLoans && <Field label="Approximate outstanding loan amount (INR)" name="outstanding_loan" type="number" value={data.outstanding_loan} onChange={onChange} />}
    </div>
    {large && <Field label="Brief description of project" name="description" value={data.description} onChange={onChange} placeholder="Tell us what you plan to build" />}
    {sanitation && <div className="grid md:grid-cols-2 gap-6 border-t border-line pt-6">
      <Field label="Equipment required?" name="equipment_required" value={data.equipment_required} onChange={onChange} options={['Yes', 'No']} />
      <Field label="Vehicle required?" name="vehicle_required" value={data.vehicle_required} onChange={onChange} options={['Yes', 'No']} />
      <Field label="Type of equipment" name="equipment_type" value={data.equipment_type} onChange={onChange} />
      <Field label="Type of vehicle" name="vehicle_type" value={data.vehicle_type} onChange={onChange} />
      <Field label="Individual / Group" name="applicant_type" value={data.applicant_type} onChange={onChange} options={['Individual', 'Group']} />
    </div>}
  </div>
}

export default function BusinessInput() {
  const { assessment, setAssessment, setAssessmentResult } = useAssessment()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [submitState, setSubmitState] = useState('idle')
  const selectedPurpose = assessment.requirement?.purpose
  const corporation = assessment.corporation

  const update = (section, field) => (eventOrValue) => {
    const value = eventOrValue && eventOrValue.target ? eventOrValue.target.value : eventOrValue
    setAssessment((current) => setNested(current, section, field, value))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const selectCorporation = (id) => {
    setAssessment((current) => current.corporation && current.corporation !== id
      ? { ...current, corporation: id, requirement: { purpose: '', beneficiary_type: '' }, business: {}, education: {}, group: {}, nskfdc: {} }
      : { ...current, corporation: id })
    setErrors({})
  }

  const validate = () => {
    const next = {}
    if (step === 1 && !corporation) next.corporation = 'Choose an organization to continue.'
    if (step === 2) {
      const profile = assessment.profile
      if (!profile.age || Number(profile.age) <= 0) next.age = 'Enter a valid age.'
      if (!profile.gender) next.gender = 'Select your gender.'
      if (!profile.state) next.state = 'Select your state.'
      if (!profile.district) next.district = 'Enter your district.'
      if (profile.annual_family_income === '' || Number(profile.annual_family_income) < 0) next.annual_family_income = 'Enter a valid income.'
      if (!profile.rural_urban) next.rural_urban = 'Select a location type.'
      if (!profile.occupation) next.occupation = 'Select your occupation.'
      if (corporation === 'NBCFDC' && !profile.category) next.category = 'Select a social category.'
      if (corporation === 'NBCFDC' && profile.caste_certificate === null) next.caste_certificate = 'Select an option.'
    }
    if (step === 3) {
      if (!selectedPurpose) next.purpose = 'Choose the kind of assistance you need.'
      if (corporation === 'NSKFDC' && !assessment.requirement.beneficiary_type) next.beneficiary_type = 'Choose the option that best describes you.'
    }
    if (step === 4) {
      const data = selectedPurpose === 'education' ? assessment.education : selectedPurpose === 'group' ? assessment.group : assessment.business
      if (selectedPurpose === 'education') {
        if (!data.course_name) next.course_name = 'Enter the course name.'
        if (!data.institution) next.institution = 'Enter the institution.'
        if (!data.course_fee || Number(data.course_fee) <= 0) next.course_fee = 'Enter a valid course fee.'
      } else if (selectedPurpose === 'group') {
        if (!data.total_members || Number(data.total_members) <= 0) next.total_members = 'Enter the number of members.'
        if (data.backward_class_members === '' || Number(data.backward_class_members) < 0 || Number(data.backward_class_members) > Number(data.total_members)) next.backward_class_members = 'Enter a valid member count.'
      } else {
        if (!data.type) next.type = 'Describe the business.'
        if (!data.status) next.status = 'Select a business status.'
        for (const field of ['project_cost', 'loan_required', 'own_contribution']) if (data[field] === '' || Number(data[field]) <= 0 && field !== 'own_contribution') next[field] = 'Enter a valid amount.'
        if (Number(data.loan_required) > Number(data.project_cost)) next.loan_required = 'Loan cannot exceed project cost.'
        if (Number(data.own_contribution) > Number(data.project_cost)) next.own_contribution = 'Contribution cannot exceed project cost.'
        if (data.existing_loans === undefined || data.existing_loans === '') next.existing_loans = 'Select an option.'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const nextStep = () => { if (validate()) setStep((current) => Math.min(5, current + 1)) }
  const previousStep = () => { setErrors({}); setStep((current) => Math.max(1, current - 1)) }

  const cleanPayload = () => {
    const payload = { corporation, profile: { ...assessment.profile }, requirement: { ...assessment.requirement } }
    Object.keys(payload.profile).forEach((key) => { if (payload.profile[key] === '') delete payload.profile[key] })
    Object.keys(payload.requirement).forEach((key) => { if (payload.requirement[key] === '') delete payload.requirement[key] })
    const detailKey = selectedPurpose === 'education' ? 'education' : selectedPurpose === 'group' ? 'group' : 'business'
    payload[detailKey] = { ...assessment[detailKey] }
    const numericFields = ['age', 'annual_family_income']
    numericFields.forEach((field) => { if (payload.profile[field] !== undefined) payload.profile[field] = Number(payload.profile[field]) })
    if (payload.profile.caste_certificate === 'true') payload.profile.caste_certificate = true
    if (payload.profile.caste_certificate === 'false') payload.profile.caste_certificate = false
    ;['course_fee', 'project_cost', 'loan_required', 'own_contribution', 'outstanding_loan', 'total_members', 'backward_class_members'].forEach((field) => {
      if (payload[detailKey][field] !== undefined && payload[detailKey][field] !== '') payload[detailKey][field] = Number(payload[detailKey][field])
    })
    if (payload[detailKey].existing_loans === 'true') payload[detailKey].existing_loans = true
    if (payload[detailKey].existing_loans === 'false') payload[detailKey].existing_loans = false
    if (corporation === 'NSKFDC') payload.nskfdc = { beneficiary_type: assessment.requirement.beneficiary_type }
    return payload
  }

  const submit = async () => {
    setSubmitState('loading')
    try {
      const response = await submitAssessment(cleanPayload())
      const result = response.data || response
      setAssessmentResult(result)
      setSubmitState('success')
      navigate(`/scheme-results/${result.recommendation?.scheme_code || 'unavailable'}`)
    } catch (error) { setSubmitState('error') }
  }

  const detailChange = (event) => update(selectedPurpose === 'education' ? 'education' : selectedPurpose === 'group' ? 'group' : 'business', event.target.name)(event)
  const detailData = selectedPurpose === 'education' ? assessment.education : selectedPurpose === 'group' ? assessment.group : assessment.business
  const detailErrors = errors

  return <div className="assessment-page grid-bg-fine">
    <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10 md:py-16">
      <div className="flex items-center justify-between mb-12"><Link to="/" className="text-sm font-semibold text-inkSoft hover:text-saffron">← Back</Link><span className="font-mono text-xs text-inkSoft">SECURE · NO LOGIN REQUIRED</span></div>
      <div className="max-w-4xl mx-auto">
        <p className="eyebrow">Start Assessment</p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8"><div><h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Tell us what you&apos;re considering.</h1><p className="text-inkSoft">Find the government scheme that best matches your needs.</p></div><span className="font-mono text-sm text-inkSoft shrink-0">Step {step} of 5</span></div>
        <StepIndicator totalSteps={5} currentStep={step} />
        <section className="assessment-panel mt-12" aria-live="polite">
          {step === 1 && <><h2 className="assessment-title">Which organization applies to you?</h2><p className="text-inkSoft mb-8">Choose the organization under which you want to explore available schemes.</p><ChoiceGrid options={corporations} value={corporation} onChange={selectCorporation} />{errors.corporation && <p className="text-maroon text-sm mt-4">{errors.corporation}</p>}</>}
          {step === 2 && <><h2 className="assessment-title">Tell us about you</h2><p className="text-inkSoft mb-8">These details help the assessment engine understand your profile.</p><div className="grid md:grid-cols-2 gap-6"><Field label="Age" name="age" type="number" value={assessment.profile.age} onChange={update('profile', 'age')} required error={errors.age} /><Field label="Gender" name="gender" value={assessment.profile.gender} onChange={update('profile', 'gender')} options={['Male', 'Female', 'Other', 'Prefer not to say']} required error={errors.gender} /><Field label="State" name="state" value={assessment.profile.state} onChange={update('profile', 'state')} options={states} required error={errors.state} /><Field label="District" name="district" value={assessment.profile.district} onChange={update('profile', 'district')} placeholder="Enter your district" required error={errors.district} /><Field label="Annual family income (INR)" name="annual_family_income" type="number" value={assessment.profile.annual_family_income} onChange={update('profile', 'annual_family_income')} required error={errors.annual_family_income} /><Field label="Location type" name="rural_urban" value={assessment.profile.rural_urban} onChange={update('profile', 'rural_urban')} options={[{ value: 'rural', label: 'Rural' }, { value: 'urban', label: 'Urban' }]} required error={errors.rural_urban} /><Field label="Current occupation" name="occupation" value={assessment.profile.occupation} onChange={update('profile', 'occupation')} options={occupations} required error={errors.occupation} />{corporation === 'NBCFDC' && <><Field label="Social category" name="category" value={assessment.profile.category} onChange={update('profile', 'category')} options={['OBC', 'Other']} required error={errors.category} /><Field label="Valid caste certificate?" name="caste_certificate" value={assessment.profile.caste_certificate === true ? 'true' : assessment.profile.caste_certificate === false ? 'false' : ''} onChange={(event) => update('profile', 'caste_certificate')(event.target.value === 'true' ? true : event.target.value === 'false' ? false : null)} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }, { value: 'null', label: 'Not sure' }]} required error={errors.caste_certificate} /></>}</div></>}
          {step === 3 && <><h2 className="assessment-title">{corporation === 'NSKFDC' ? 'Which best describes you?' : 'What do you need assistance for?'}</h2><p className="text-inkSoft mb-8">Your answers guide which questions we ask next. They do not determine eligibility.</p>{corporation === 'NSKFDC' && <div className="mb-10"><ChoiceGrid options={beneficiaryTypes.map((label) => ({ id: label, label }))} value={assessment.requirement.beneficiary_type} onChange={update('requirement', 'beneficiary_type')} columns="md:grid-cols-2" />{errors.beneficiary_type && <p className="text-maroon text-sm mt-4">{errors.beneficiary_type}</p>}</div>}<h3 className="font-display text-2xl font-semibold mb-4">{corporation === 'NSKFDC' ? 'What kind of support are you looking for?' : corporation === 'NBCFDC' ? 'What do you need assistance for?' : 'Which type of assistance are you looking for?'}</h3><ChoiceGrid options={(purposeOptions[corporation] || []).map(({ id, label }) => ({ id, label }))} value={selectedPurpose} onChange={update('requirement', 'purpose')} columns="md:grid-cols-2" />{errors.purpose && <p className="text-maroon text-sm mt-4">{errors.purpose}</p>}</>}
          {step === 4 && <><h2 className="assessment-title">{selectedPurpose === 'education' ? 'Education details' : selectedPurpose === 'group' ? 'Group / SHG details' : 'Business details'}</h2><p className="text-inkSoft mb-8">Share only the information relevant to your selected requirement.</p>{selectedPurpose === 'education' ? <div className="grid md:grid-cols-2 gap-6">{educationFields.map(([name, label, type]) => <Field key={name} label={label} name={name} type={type} value={detailData[name]} onChange={detailChange} required error={detailErrors[name]} />)}<Field label="Course type" name="course_type" value={detailData.course_type} onChange={detailChange} options={['Professional', 'Technical', 'Other']} /><Field label="Country" name="country" value={detailData.country || 'India'} onChange={detailChange} options={['India', 'Abroad']} /><Field label="Admission status" name="admission_status" value={detailData.admission_status} onChange={detailChange} options={['Planning', 'Applied', 'Admitted', 'Currently Studying']} /><Field label="Current education level" name="education_level" value={detailData.education_level} onChange={detailChange} /></div> : selectedPurpose === 'group' ? <div className="grid md:grid-cols-2 gap-6"><Field label="Group type" name="group_type" value={detailData.group_type} onChange={detailChange} options={['Self Help Group', 'Other']} /><Field label="Number of members" name="total_members" type="number" value={detailData.total_members} onChange={detailChange} required error={detailErrors.total_members} /><Field label="Backward Class members" name="backward_class_members" type="number" value={detailData.backward_class_members} onChange={detailChange} required error={detailErrors.backward_class_members} /><Field label="Estimated project cost (INR)" name="project_cost" type="number" value={detailData.project_cost} onChange={detailChange} /><Field label="Required loan amount (INR)" name="loan_required" type="number" value={detailData.loan_required} onChange={detailChange} /></div> : <BusinessFields data={detailData} onChange={detailChange} errors={detailErrors} large={selectedPurpose === 'large_income_generating_project' || selectedPurpose === 'large_business'} sanitation={selectedPurpose === 'sanitation_enterprise'} />}{selectedPurpose === 'group' && detailData.total_members > 0 && <p className="mt-6 font-mono text-sm text-inkSoft">Backward Class Members: {detailData.backward_class_members || 0} / {detailData.total_members} ({Math.round((Number(detailData.backward_class_members || 0) / Number(detailData.total_members)) * 100)}%)</p>}</>}
          {step === 5 && <><h2 className="assessment-title">Review your assessment</h2><p className="text-inkSoft mb-8">Check your answers before sending the structured assessment to the backend.</p><Review title="Organization" rows={[[corporation, 'Selected organization']]} onEdit={() => setStep(1)} /><Review title="About you" rows={[[assessment.profile.age, 'Age'], [assessment.profile.gender, 'Gender'], [assessment.profile.state, 'State'], [assessment.profile.district, 'District'], [money(assessment.profile.annual_family_income), 'Annual family income'], [assessment.profile.occupation, 'Occupation']]} onEdit={() => setStep(2)} /><Review title="Requirement" rows={[[selectedPurpose, 'Purpose'], ...(corporation === 'NSKFDC' ? [[assessment.requirement.beneficiary_type, 'Beneficiary type']] : [])]} onEdit={() => setStep(3)} /><Review title="Details" rows={Object.entries(detailData).filter(([, value]) => value !== '' && value !== undefined && value !== null).slice(0, 8).map(([key, value]) => [typeof value === 'number' && key !== 'total_members' ? money(value) : String(value), key.replaceAll('_', ' ')])} onEdit={() => setStep(4)} />{submitState === 'error' && <div className="mt-6 border-2 border-maroon/30 bg-maroon/5 p-4 rounded-xl text-maroon" role="alert"><strong>We couldn&apos;t complete your assessment.</strong><p className="text-sm mt-1">Please try again. Your answers are still saved.</p></div>}{submitState === 'success' && <p className="mt-6 text-go font-semibold">Assessment submitted.</p>}</>}
          <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-line"><button type="button" onClick={previousStep} disabled={step === 1 || submitState === 'loading'} className="btn-ghost px-5 py-3 font-bold disabled:opacity-30">← Back</button>{step < 5 ? <button type="button" onClick={nextStep} className="btn-primary text-beige font-bold px-7 py-3 rounded-full">Continue →</button> : <button type="button" onClick={submit} disabled={submitState === 'loading'} className="btn-primary text-beige font-bold px-7 py-3 rounded-full disabled:opacity-60">{submitState === 'loading' ? 'Analyzing your profile...' : 'Find My Schemes →'}</button>}</div>
        </section>
      </div>
    </div>
  </div>
}

function Review({ title, rows, onEdit }) {
  return <div className="border-t border-line py-5"><div className="flex items-center justify-between mb-4"><h3 className="font-display text-xl font-semibold">{title}</h3><button type="button" onClick={onEdit} className="text-sm font-bold text-saffronDeep hover:underline">Edit</button></div><dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2">{rows.map(([value, label]) => <div key={label} className="flex justify-between gap-4 text-sm"><dt className="text-inkSoft capitalize">{label}</dt><dd className="font-semibold text-right">{value || 'Not provided'}</dd></div>)}</dl></div>
}
