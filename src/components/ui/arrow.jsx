export function Arrow({ targetSelector, offset = 20 }) {
    const [position, setPosition] = React.useState({ top: 0, left: 0, rotation: 0 });
  
    React.useEffect(() => {
      function updatePosition() {
        const target = document.querySelector(targetSelector);
        if (!target) return;
  
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
  
        // Calculate position based on which edge of the screen the element is closest to
        const distanceToTop = rect.top;
        const distanceToBottom = window.innerHeight - rect.bottom;
        const distanceToLeft = rect.left;
        const distanceToRight = window.innerWidth - rect.right;
  
        const minDistance = Math.min(distanceToTop, distanceToBottom, distanceToLeft, distanceToRight);
  
        let top, left, rotation;
  
        switch (minDistance) {
          case distanceToTop: // Arrow should point down
            top = rect.top - offset - 40; // 40 is arrow height
            left = centerX - 15; // 15 is half arrow width
            rotation = 180;
            break;
          case distanceToBottom: // Arrow should point up
            top = rect.bottom + offset;
            left = centerX - 15;
            rotation = 0;
            break;
          case distanceToLeft: // Arrow should point right
            top = centerY - 15;
            left = rect.left - offset - 40;
            rotation = 90;
            break;
          case distanceToRight: // Arrow should point left
            top = centerY - 15;
            left = rect.right + offset;
            rotation = 270;
            break;
          default:
            return;
        }
  
        setPosition({ top, left, rotation });
      }
  
      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }, [targetSelector, offset]);
  
    return (
      <div 
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 70,
          transform: `rotate(${position.rotation}deg)`,
          transition: 'all 0.3s ease'
        }}
        className="animate-bounce"
      >
        <svg 
          width="30" 
          height="40" 
          viewBox="0 0 30 40" 
          fill="none"
        >
          <path 
            d="M15 0L30 10L22 10L22 40L8 40L8 10L0 10L15 0Z" 
            fill="#ef4444"
          />
        </svg>
      </div>
    );
  }