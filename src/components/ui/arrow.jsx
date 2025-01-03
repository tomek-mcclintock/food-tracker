export function Arrow({ direction, position, style }) {
    const arrowStyles = {
      position: 'fixed',
      zIndex: 70,
      ...style
    };
  
    return (
      <div 
        style={arrowStyles}
        className="animate-bounce"
      >
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none"
          style={{
            transform: `rotate(${direction}deg)`
          }}
        >
          <path 
            d="M12 4L3 13L7 13L7 20L17 20L17 13L21 13L12 4Z" 
            fill="#ef4444"
          />
        </svg>
      </div>
    );
  }