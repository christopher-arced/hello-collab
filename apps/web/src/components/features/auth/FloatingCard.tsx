interface FloatingCardProps {
  position: string
  rotation: string
  delay?: string
}

const FloatingCard = ({ position, rotation, delay = '' }: FloatingCardProps) => {
  return (
    <div
      className={`absolute ${position} w-[180px] h-[100px] bg-gradient-to-br from-black/[0.03] dark:from-white/[0.03] to-black/[0.01] dark:to-white/[0.01] rounded-xl border border-black/5 dark:border-white/5 backdrop-blur-lg animate-float ${rotation} ${delay}`}
    >
      <div className="p-3 border-b border-black/5 dark:border-white/5">
        <div className="w-20 h-2 bg-black/10 dark:bg-white/10 rounded" />
      </div>
      <div className="p-3 flex gap-1.5">
        <div className="w-5 h-5 rounded-full bg-indigo-500/30" />
        <div>
          <div className="w-[60px] h-1.5 bg-black/[0.08] dark:bg-white/[0.08] rounded mb-1" />
          <div className="w-10 h-1.5 bg-black/5 dark:bg-white/5 rounded" />
        </div>
      </div>
    </div>
  )
}

export default FloatingCard
