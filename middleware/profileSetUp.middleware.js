const prisma = require("../prisma");

const requireCompleteProfile = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { profile: true }
  });

  if (!user.profile) {
    return res.status(403).json({
      message: "Please complete your profile set up first"
    });
  }

  next();
};

module.exports = requireCompleteProfile;
