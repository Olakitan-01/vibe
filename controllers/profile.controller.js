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
      dateOfBirth: user.profile?.dateOfBirth ?? null,
      bio: user.profile?.bio ?? null,
      address: user.profile?.address ?? null,
      interests: user.profile?.interests ?? null,
      profilePic: user.profile?.profilePic ?? null,
      
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

// PATCH /me - Update user and profile
const updateMe = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const {
      firstName,
      lastName,
      username,
      gender,
      email,
      phone,
      dateOfBirth,
      bio,
      address,
      interests,
      profilePic,
    } = req.body;

    //Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //Update User table (only fields provided)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName ?? existingUser.firstName,
        lastName: lastName ?? existingUser.lastName,
        username: username ?? existingUser.username,
        gender: gender ?? existingUser.gender,
        email: email ?? existingUser.email,
        phone: phone ?? existingUser.phone,
      },
    });

    //Update Profile table (create if doesn't exist)
    let updatedProfile;
    if (existingUser.profile) {
      updatedProfile = await prisma.profile.update({
        where: { userId: userId },
        data: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingUser.profile.dateOfBirth,
          bio: bio ?? existingUser.profile.bio,
          address: address ?? existingUser.profile.address,
          interests: interests ?? existingUser.profile.interests,
          profilePic: profilePic ?? existingUser.profile.profilePic,
        },
      });
    } else {
      // Profile doesn't exist yet, create one
      updatedProfile = await prisma.profile.create({
        data: {
          userId: userId,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          bio: bio ?? null,
          address: address ?? null,
          interests: interests ?? null,
          profilePic: profilePic ?? null,
        },
      });
    }

    //Merge User and Profile into a flat JSON
    const mergedData = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      username: updatedUser.username,
      gender: updatedUser.gender,
      email: updatedUser.email,
      phone: updatedUser.phone,
      dateOfBirth: updatedProfile?.dateOfBirth
        ? updatedProfile.dateOfBirth.toISOString().split('T')[0] // format as YYYY-MM-DD
        : null,
      bio: updatedProfile?.bio ?? null,
      address: updatedProfile?.address ?? null,
      interests: updatedProfile?.interests ?? null,
      profilePic: updatedProfile?.profilePic ?? null,
    };
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: mergedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
    getMe,
    updateMe
  }