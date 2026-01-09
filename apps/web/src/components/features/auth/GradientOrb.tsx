interface GradientOrbProps {
  position: string
  size: string
  color: string
  blur: string
  delay?: string
}

const GradientOrb = ({ position, size, color, blur, delay = '' }: GradientOrbProps) => {
  return (
    <div
      className={`absolute ${position} ${size} rounded-full ${blur} animate-pulse-glow ${color} ${delay}`}
    />
  )
}

export default GradientOrb
