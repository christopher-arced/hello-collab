interface LogoProps {
  size?: 'sm' | 'lg'
}

const Logo = ({ size = 'sm' }: LogoProps) => {
  const sizeClasses = {
    sm: {
      container: 'gap-2.5',
      icon: 'w-10 h-10 rounded-xl shadow-lg shadow-indigo-500/30',
      letter: 'text-xl',
      text: 'text-lg',
    },
    lg: {
      container: 'gap-3.5',
      icon: 'w-14 h-14 rounded-2xl shadow-lg shadow-indigo-500/40',
      letter: 'text-[28px]',
      text: 'text-[28px]',
    },
  }

  const classes = sizeClasses[size]

  return (
    <div className={`flex items-center ${classes.container}`}>
      <div
        className={`${classes.icon} bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center animate-gradient-shift bg-[length:200%_200%]`}
      >
        <span className={`${classes.letter} font-bold text-white font-mono`}>H</span>
      </div>
      <span className={`${classes.text} font-semibold text-white tracking-tight`}>HelloCollab</span>
    </div>
  )
}

export default Logo
