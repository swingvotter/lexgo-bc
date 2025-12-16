const User = require("../../models/user.Model");
const bcrypt = require("bcrypt")

const registerUser = async (req, res) => {
  try {

    const detectedC = req.detectedCountry

    const {
      firstName,
      lastName,
      otherName,
      phoneNumber,
      university,
      acadamicLevel,
      program,
      email,
      studentId,
      password,
      role,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !university ||
      !acadamicLevel ||
      !program ||
      !email ||
      !studentId ||
      !password) {     
        return res.status(400).json({ success: true, message: "invalid fields",doc:"make sure all fields are correctly spelt and included" });
      }
      
      const existingUser = await User.findOne({email})
      
      if(existingUser){
      return res.status(400).json({ success: true, message: "user already exist"}); 
     }

     const hashPassword = await bcrypt.hash(password,10)

     const user = await User.create({firstName,
      lastName,
      otherName,
      phoneNumber,
      university,
      acadamicLevel,
      program,
      email,
      studentId,
      password:hashPassword,
      role,
      detectedCountry:detectedC
    })

    return res.status(201).json({ success: true, message: "account created successfully",data:user });

  } catch (error) {
    return res.status(500).json({ success: false, message: `error:: ${error}` });
  }
};

module.exports = registerUser;
