const User = require("../models/userModel");

exports.generateUniqueMemberId = async (
  name,
  chapterShortCode,
  existingIdsSet
) => {
  if (!name || !chapterShortCode) {
    throw new Error("Both name and chapterShortCode are required");
  }

  const firstLetter = name.charAt(0).toUpperCase();
  let counter = 1;
  let uniqueMemberId;
  let isUnique = false;

  while (!isUnique) {
    const counterString = counter < 10 ? `0${counter}` : `${counter}`;
    uniqueMemberId = `${chapterShortCode}${firstLetter}${counterString}`;

    const existingUser = await User.findOne({ memberId: uniqueMemberId });

    if (!existingUser && !existingIdsSet?.has(uniqueMemberId)) {
      isUnique = true;
    } else {
      counter++;
    }
  }

  return uniqueMemberId;
};
