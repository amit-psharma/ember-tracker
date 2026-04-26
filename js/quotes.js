const quotes = [
  "Deep work is the superpower of the 21st century.",
  "Focus is a muscle. Train it.",
  "What you do today is important because you are exchanging a day of your life for it.",
  "The obstacle is the way.",
  "Small disciplines repeated with consistency every day lead to great achievements.",
  "Action expresses priorities.",
  "Don't wait for inspiration. It comes while working.",
  "We are what we repeatedly do. Excellence is not an act, but a habit."
];

export function initQuotesCarousel(elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;

  let currentIndex = Math.floor(Math.random() * quotes.length);
  
  const displayQuote = () => {
    // Fade out
    container.style.opacity = 0;
    container.style.transform = 'translateY(-4px)';
    
    setTimeout(() => {
      container.textContent = quotes[currentIndex];
      // Fade in
      container.style.opacity = 1;
      container.style.transform = 'translateY(0)';
      
      currentIndex = (currentIndex + 1) % quotes.length;
    }, 400); // Wait for fade out
  };

  // Initial display
  displayQuote();

  // Rotate every 15 seconds
  setInterval(displayQuote, 15000);
}
