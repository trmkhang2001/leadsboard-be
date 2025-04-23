const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken };
};

// Đăng ký người dùng
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hash });
        await newUser.save();
        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(500).json({ error: "Email already exists or invalid" });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({ message: "Login successful" });
};

// Làm mới access token
exports.refreshToken = (req, res) => {
    const token = req.cookies?.refreshToken;
    console.log("Received token:", token);
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.sendStatus(403);
        }

        console.log("Decoded refresh token:", decoded); // ✅ kiểm tra kỹ giá trị này

        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: "Access token refreshed" });
    });
};

// Đăng xuất
exports.logout = (req, res) => {
    res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json({ message: "Logged out" });
};
