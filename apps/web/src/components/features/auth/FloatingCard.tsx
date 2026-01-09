interface FloatingCardProps {
  position: string
  rotation: string
  delay?: string
}

const FloatingCard = ({ position, rotation, delay = '' }: FloatingCardProps) => {
  return (
    <div
      className={`absolute ${position} w-[180px] h-[100px] bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl border border-white/5 backdrop-blur-lg animate-float ${rotation} ${delay}`}
    >
      <div className="p-3 border-b border-white/5">
        <div className="w-20 h-2 bg-white/10 rounded" />
      </div>
      <div className="p-3 flex gap-1.5">
        <div className="w-5 h-5 rounded-full bg-indigo-500/30" />
        <div>
          <div className="w-[60px] h-1.5 bg-white/[0.08] rounded mb-1" />
          <div className="w-10 h-1.5 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  )
}

export default FloatingCard
