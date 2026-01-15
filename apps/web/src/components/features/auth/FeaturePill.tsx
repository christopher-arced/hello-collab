interface FeaturePillProps {
  icon: string
  text: string
  delay?: number
}

const FeaturePill = ({ icon, text, delay = 0 }: FeaturePillProps) => {
  return (
    <div
      className="py-2.5 px-[18px] bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-3xl flex items-center gap-2 animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}s` }}
    >
      <span>{icon}</span>
      <span className="text-[13px] text-theme-text-secondary dark:text-theme-dark-text-secondary font-medium">
        {text}
      </span>
    </div>
  )
}

export default FeaturePill
