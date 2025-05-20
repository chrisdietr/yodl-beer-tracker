export function createBubbles() {
  const container = document.getElementById('background-container');
  
  if (!container) return;
  
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  
  // Clear existing bubbles
  container.innerHTML = '';
  
  // Create new bubbles
  for (let i = 0; i < 15; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'beer-bubble';
    
    // Random size between 10px and 30px
    const size = Math.floor(Math.random() * 20) + 10;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    // Random position
    bubble.style.left = `${Math.random() * containerWidth}px`;
    bubble.style.bottom = `${Math.random() * 100}px`;
    
    // Random animation delay
    bubble.style.animationDelay = `${Math.random() * 5}s`;
    
    container.appendChild(bubble);
  }
  
  // Recreate bubbles every 15 seconds to keep the animation fresh
  setTimeout(createBubbles, 15000);
}
