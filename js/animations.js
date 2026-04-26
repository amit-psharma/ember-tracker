export function triggerHaptic(duration = 40) {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

export function createParticleBurst(element) {
  const rect = element.getBoundingClientRect();
  const numParticles = Math.floor(Math.random() * 3) + 3; // 3 to 5 particles
  
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.backgroundColor = '#9F4846';
    
    // Starting position at center of element
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    
    document.body.appendChild(particle);

    // Random velocity
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 20 + 20; // 20 to 40 px spread
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 20; // Bias upwards

    // Animate using Web Animations API for smooth isolated rendering
    particle.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
    ], {
      duration: 300 + Math.random() * 100, // 300-400ms
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      fill: 'forwards'
    }).onfinish = () => {
      particle.remove();
    };
  }
}

export function triggerCracker(element) {
  triggerHaptic([50, 100, 50, 150, 100, 200]); // Longer, grander haptic

  const rect = element.getBoundingClientRect();
  const numParticles = 80; // Grander: 80 particles instead of 20
  const colors = ['#E8A23B', '#3DA068', '#3498DB', '#9B59B6', '#E74C3C', '#F1C40F', '#1ABC9C'];
  
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Varying sizes for a more dynamic look
    const size = Math.random() * 8 + 4; // 4px to 12px
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Starting position
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    
    document.body.appendChild(particle);

    // Explosion physics
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 150 + 50; // Grander spread
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity - 60; // Stronger upward bias

    particle.animate([
      { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: 2000 + Math.random() * 500, // 2 to 2.5 seconds
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // Decelerate quickly
      fill: 'forwards'
    }).onfinish = () => {
      particle.remove();
    };
  }
}
