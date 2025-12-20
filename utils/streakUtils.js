const updateLoginStreak = (user) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Initialize if doesn't exist
  if (!user.progress.lastActiveDate) {
    user.progress.learningStreak = 1;
    user.progress.lastActiveDate = today;
    return;
  }
  
  const lastActive = new Date(user.progress.lastActiveDate);
  const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  
  const diffTime = today - lastActiveDay;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Already logged in today - no change
    return;
  } else if (diffDays === 1) {
    // Logged in yesterday - continue streak
    user.progress.learningStreak = (user.progress.learningStreak || 0) + 1;
  } else {
    // Missed a day or more - reset to 1
    user.progress.learningStreak = 1;
  }
  
  // Update lastActiveDate
  user.progress.lastActiveDate = today;
};

module.exports = updateLoginStreak