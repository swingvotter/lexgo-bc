const updateLoginStreak = async (user) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Initialize if doesn't exist
    if (!user.lastActive) {
      user.progress.learningStreak = 1;
      user.lastActive = today;
      await user.save();
      return;
    }

    const lastActive = new Date(user.lastActive);
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

    // Update lastActive and save
    user.lastActive = today;
    await user.save();
  } catch (error) {
    console.error("Error updating login streak:", error);
    // Don't throw - we don't want to block login if streak update fails
  }
};

module.exports = updateLoginStreak;