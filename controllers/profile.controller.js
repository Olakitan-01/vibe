const prisma = require('../config/prisma.config');

const getMe = async (req, res) => {
   try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },  // Fetch related profile
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge into flat JSON, handle null profile
    const mergedData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      ...(user.profile ? {
        dateOfBirth: user.profile.dateOfBirth,
        bio: user.profile.bio,
        address: user.profile.address,
        interest: user.profile.interest,
        profilePic: user.profile.profilePic,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
      } : {}),
    };

    // Exclude sensitives
    delete mergedData.password;  // Safety net
    delete mergedData.createdAt;  // Safety net
    delete mergedData.updatedAt;  // Safety net

    res.json(mergedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateMe = async (req, res) => {

}


module.exports = {
    getMe,
    updateMe
    

}