const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
   try  {
    const {username, email, password, role } = req.body;
    const checkExistingUser = await User.findOne({$or : [{username}, {email}] });
    if (checkExistingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists either with same username or same email. Please try again.',
        })
    }
    // hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newlyCreatedUser = new User({
        username,
        email,
        password: hashedPassword,
        role:role || 'user'
    });
    await newlyCreatedUser.save();

    newlyCreatedUser
    ? res.status(201).json({ success: true, message: 'User regitered successfully', data: newlyCreatedUser, })
    : res.status(400).json({ success: false, message: 'Unable to register new user' });

   } catch(err) {
       console.log(err);
       res.status(500).json({
           success: false,
           message: 'Something went wrong ! Please try later',
       })
   }
}

const loginUser = async (req, res) => {
    try {
        // 1. Réception de la requête POST sur la route `/login
        // 2. Extraction des credential
        const { username, password } = req.body;

        // 3. Vérification en base de données si le user existe ou non
        const user = await User.findOne({ username });

        if(!user) {
            return res.status(400).json({
                success: false,
                message: `User does not exist!`,
            })
        }
        // Check if the password is correct or not
        const isPasswordMatch = await bcrypt.compare(password,user.password);
        if(!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials',
            })
        }

        const accessToken = await jwt.sign({
            userId: user._id,
            username: user.username,
            role: user.role,
        },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30m' },
        )

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            accessToken,
        })


    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Some error occured ! Please try later',
        })
    }
}

const changePassword = async (req, res) => {
    try {
        // 1. Identifier l'utilisateur courant
        const userId = req.userInfo.userId;

        // 2. extract old and new password
        const { oldPassword, newPassword } = req.body;

        // 3. find the current logged user
        const user = await User.findById(userId);
        // Vérifier l'existence de l'utilisateur*
        if(!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found!',
            })
        }
        // 4. check if the old password is correct
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
            if(!isPasswordMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Password does not match!',
                })
            }

        // 5. Générer un hash pour le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword =   await bcrypt.hash(newPassword, salt);

        // 6. Mettre à jour le mot de passe de l'utilisateur
        user.password = newHashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Some error occured ! Please try later',
        })
    }
}

module.exports = { registerUser, loginUser, changePassword };