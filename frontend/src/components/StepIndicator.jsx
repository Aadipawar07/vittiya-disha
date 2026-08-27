// Multi-step form progress bar
export default function StepIndicator({ totalSteps = 4, currentStep = 1 }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          {/* Step circle */}
          <div
            className={`step-dot w-9 h-9 rounded-full font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 ${
              step <= currentStep
                ? 'bg-saffron text-beige'
                : 'bg-beigeDeep text-inkSoft'
            }`}
          >
            {step}
          </div>

          {/* Connecting line (only after non-last steps) */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 bg-beigeDeep rounded mx-2 overflow-hidden">
              <div
                className="step-line-fill h-full bg-saffron rounded"
                style={{
                  width: currentStep > step ? '100%' : '0%'
                }}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
