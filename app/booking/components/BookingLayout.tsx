'use client'

type Props = {
  title: string
  children: React.ReactNode
  buttonText?: string
  onNext?: () => void
}

export default function BookingLayout({
  title,
  children,
  buttonText,
  onNext,
}: Props) {
  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col items-center">
      
      {/* LOGO */}
      <div className="mt-10 mb-6 text-3xl tracking-widest text-gray-400">
        YASINŞAHİN
      </div>

      {/* STEP BAR */}
      <div className="flex gap-6 mb-8 text-gray-400 text-sm">
        <span>📞</span>
        <span>✂️</span>
        <span>📅</span>
        <span>👤</span>
        <span>✅</span>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-center text-xl font-semibold mb-6">
          {title}
        </h1>

        <div className="flex flex-col gap-3">
          {children}
        </div>

        {buttonText && (
          <button
            onClick={onNext}
            className="mt-6 w-full bg-black text-white py-3 rounded-lg text-sm font-medium"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}