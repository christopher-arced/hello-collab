interface GridPatternProps {
  size?: number
  opacity?: number
  maskRadius?: number
}

const GridPattern = ({ size = 60, opacity = 0.02, maskRadius = 20 }: GridPatternProps) => {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        maskImage: `radial-gradient(ellipse at center, black ${maskRadius}%, transparent 70%)`,
        WebkitMaskImage: `radial-gradient(ellipse at center, black ${maskRadius}%, transparent 70%)`,
      }}
    />
  )
}

export default GridPattern
