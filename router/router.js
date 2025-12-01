const express = require("express");
const router = express.Router();
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const userModel = require("../model/users");
const memberModel = require("../model/member");
const adminModel = require("../model/admin");
const cookieParser = require("cookie-parser");
const upload = require("../middleware/multerConfig");
const fs = require("fs");
const path = require("path");

const ALLOWED_TASKS = new Set([
    "task1",
    "task2",
    "task3",
    "task2point1",
    "task2pointwo",
    "task2pointhree",
    "tasktwopointfour",
    "taskthreepointone",
    "taskthreepointwo",
    "taskthreepointhree",
    "taskfourpointone",
    "taskfourpointwo"
]);

const resolvePublicUploadPath = (filePath = "") =>
    path.join(__dirname, "..", "public", filePath.replace(/^\/+/, ""));

// Helper function to check if user is admin (kept for potential future use)
const isAdmin = (req) => {
    // Only return true if userid is exactly "admin" (string, not MongoDB ObjectId)
    // Regular users have MongoDB ObjectIds, so this check is safe
    if (!req.user || !req.user.userid) return false;
    return req.user.userid === "admin";
};

const home = (req, res) => {
    res.render("Home");
}


const index = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userid);
        if (user) {
            const memberCount = await memberModel.countDocuments({ owner: req.user.userid });
            if (memberCount > 0 && !user.teamCreated) {
                user.teamCreated = true;
                await user.save();
            }
        }
        res.render("index", { user });
    } catch (e) {
        console.error("Error fetching user data:", e);
        res.render("index", { user: null });
    }
}

const signup = (req, res) => {
    const error = req.query.error || null;
    res.render("Ragistration", { error });
}

const ragister = async (req, res) => {
    const { email, phoneno, teamname, password, confirmPassword } = req.body;

    try {
        if (!email || !phoneno || !teamname || !password) {
            return res.redirect("/signup?error=All fields are mandatory");
        }

        if (password !== confirmPassword) {
            return res.redirect("/signup?error=Passwords do not match");
        }

        let findmail = await userModel.findOne({ email: req.body.email });
        if (findmail) {
            return res.redirect("/signup?error=Email already exists");
        }

        let hashpassword = await bcrypt.hash(String(password), 12);

        const createruser = await userModel.create({
            teamname: teamname,
            email: email,
            password: hashpassword,
            phoneno: phoneno
        });
        console.log(createruser);

        let token = jwt.sign({ email: email, userid: createruser._id }, "thenameiskunalkailasbodkhe", { expiresIn: "1h" });

        res.cookie("token", token);
        res.redirect("/home");
    }
    catch (e) {
        console.error("Registration error:", e);
        return res.redirect("/signup?error=Internal server error. Please try again.");
    }
}


const loginuser = (req, res) => {
    const error = req.query.error || null;
    res.render("Login", { error });
}



const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Login Error</title>
                </head>
                <body>
                    <script>
                        alert("Email and password are required");
                        window.location.href = "/userlogin";
                    </script>
                </body>
                </html>
            `);
        }

        console.log("Login attempt for email:", email);
        let findmail = await userModel.findOne({ email: email });

        if (!findmail) {
            console.log("User not found with email:", email);
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Login Error</title>
                </head>
                <body>
                    <script>
                        alert("Invalid credentials");
                        window.location.href = "/userlogin";
                    </script>
                </body>
                </html>
            `);
        }

        console.log("User found, comparing password...");
        // console.log("Stored password hash exists:", !!findmail.password);

        let compare = await bcrypt.compare(String(password), findmail.password);
        // console.log("Password comparison result:", compare);

        if (compare) {
            let token = jwt.sign({ email: findmail.email, userid: findmail._id }, "thenameiskunalkailasbodkhe", { expiresIn: '1h' });
            res.cookie("token", token);
            res.status(200);
            res.redirect("/home");
        }
        else {
            console.log("Password comparison failed for email:", email);
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Login Error</title>
                </head>
                <body>
                    <script>
                        alert("Invalid credentials");
                        window.location.href = "/userlogin";
                    </script>
                </body>
                </html>
            `);
        }
    }
    catch (e) {
        console.error("Login error:", e);
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Error</title>
            </head>
            <body>
                <script>
                    alert("Internal server error");
                    window.location.href = "/userlogin";
                </script>
            </body>
            </html>
        `);
    }
}


const admin = (req, res) => {
    res.render("admin");
}

const adminlogin = async (req,res)=>{
    const { email, password } = req.body;
    
    try {
        // Check if email and password are provided
        if (!email || !password) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Login Error</title>
                </head>
                <body>
                    <script>
                        alert("Email and password are required");
                        window.location.href = "/adminpanel";
                    </script>
                </body>
                </html>
            `);
        }

        // Check if credentials match
        if (email === "root@gmail.com" && password === "root") {
            // Create a token for admin (using a dummy userid since we're not using database)
            let token = jwt.sign({ email: email, userid: "admin", isAdmin: true }, "thenameiskunalkailasbodkhe", { expiresIn: '1h' });
            res.cookie("token", token);
            res.status(200);
            res.redirect("/adminpanel");
        }
        else {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Login Error</title>
                </head>
                <body>
                    <script>
                        alert("Invalid credentials");
                        window.location.href = "/admin";
                    </script>
                </body>
                </html>
            `);
        }
    }
    catch (e) {
        console.error("Admin login error:", e);
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Error</title>
            </head>
            <body>
                <script>
                    alert("Internal server error");
                    window.location.href = "/admin";
                </script>
            </body>     
            </html>
        `);
    }
}



const solotask = async (req, res) => {
    try {
        let user = await userModel.findById(req.user.userid);
        res.render("solotask", { user });
    }
    catch (e) {
        console.error("Error fetching user data:", e);
        res.render("solotask", { user: null });
    }
}



const teamtrack = (req, res) => {
    res.render("teamtrack");
}



const mentor = (req, res) => {
    res.render("mentor");
};


const associate = (req, res) => {
    res.render("associate");
}

const createteam = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userid);
        const members = await memberModel.find({ owner: req.user.userid }).sort({ createdAt: -1 });

        if (user && !user.teamCreated && members.length > 0) {
            user.teamCreated = true;
            await user.save();
        }

        res.render("createteam", { user: user, members });
        console.log(user);
    } catch (error) {
        console.error("Error fetching team data:", error);
        res.render("createteam", { user: null, members: [] });
    }
}

const addmember = (req, res) => {
    const { error, success } = req.query;
    res.render("addmember", { error: error || null, success: success || null });
}

const createMember = async (req, res) => {
    const { name, phone, email, leaderEmail } = req.body;
    if (!name || !phone || !email) {
        return res.redirect("/addmember?error=Please fill all required fields");
    }

    try {
        await memberModel.create({
            owner: req.user.userid,
            name,
            phone,
            email,
            leaderEmail
        });
        await userModel.findByIdAndUpdate(
            req.user.userid,
            { $set: { teamCreated: true } },
            { new: true }
        );
        res.redirect("/createteam");
    } catch (error) {
        console.error("Error creating member:", error);
        res.redirect("/addmember?error=Unable to add member right now");
    }
}


const task1 = (req, res) => {
    res.render("task1");
}

const task2 = (req, res) => {
    res.render("task2");
}

const task3 = (req, res) => {
    res.render("task3");
}
const task2point1 = (req, res) => {
    res.render("tasktwopointone");
}

const tasktwopointwo = (req, res) => {
    res.render("tasktwopointwo");
}

const tasktwopointhree = (req, res) => {
    res.render("tasktwopointhree");
}



const taskthreepointone = (req, res) => {
    res.render("taskthreepointone");
}



const taskthreepointwo = (req, res) => {
    res.render("taskthreepointwo");
}


const taskthreepointhree = (req, res) => {
    res.render("taskthreepointhree");
}

const tasktwopointfour = (req, res) => {
    res.render("tasktwopointfour");
}
const taskfourpointone = (req, res) => {
    res.render("taskfourpointone");
}
const taskfourpointwo = (req, res) => {
    res.render("taskfourpointwo");
}
const forgetpassword = (req, res) => {
    res.render("forgotpass");
}




const forgetpass = async (req, res) => {
    const { email, password, confirmpassword } = req.body

    try {
        let findusr = await userModel.findOne({ email: email });
        if (!findusr) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Login Error</title>
                </head>
                <body>
                    <script>
                        alert("User not exits");
                        window.location.href = "/forgetpassword";
                    </script>
                </body>
                </html>
            `);
        }
        if (password !== confirmpassword) {
            return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Login Error</title>
                    </head>
                    <body>
                        <script>
                            alert("password doesnt match");
                            window.location.href = "/forgetpassword";
                        </script>
                    </body>
                    </html>
                `);
        }
        else {
            let hashpassword = await bcrypt.hash(String(password), 12);

            let updatepass = await userModel.findOneAndUpdate(
                { email: email },
                { $set: { password: hashpassword } },)
               
              return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Login Error</title>
                    </head>
                    <body>
                        <script>
                            alert("password updated successfully");
                            window.location.href = "/forgetpassword";
                        </script>
                    </body>
                    </html>
                `);
               


        }
         

    }
    catch (e) {
        res.status(500);
        return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Login Error</title>
                    </head>
                    <body>
                        <script>
                            alert("Internal server error");
                            window.location.href = "/forgetpassword";
                        </script>
                    </body>
                    </html>
                `);

    }

}



// File Upload Handler
const uploadTaskFile = async (req, res) => {
    const taskId = req.body.taskId;

    console.log("Upload request received - Task ID:", taskId);
    console.log("Allowed tasks:", Array.from(ALLOWED_TASKS));
    console.log("Task ID in allowed set:", ALLOWED_TASKS.has(taskId));

    try {

        if (!taskId || !ALLOWED_TASKS.has(taskId)) {
            console.error("Invalid task ID:", taskId);
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ success: false, message: "Invalid task reference." });
        }

        if (req.fileValidationError) {
            return res.status(400).json({ success: false, message: req.fileValidationError });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }

        const user = await userModel.findById(req.user.userid);
        if (!user) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.taskSubmissions = user.taskSubmissions || {};
        const previousSubmission = user.taskSubmissions[taskId];

        if (previousSubmission && previousSubmission.filePath) {
            const previousPath = resolvePublicUploadPath(previousSubmission.filePath);
            if (fs.existsSync(previousPath)) {
                fs.unlinkSync(previousPath);
            }
        }

        const storedPath = `/uploads/${req.file.filename}`;

        user.taskSubmissions[taskId] = {
            fileName: req.file.filename,
            filePath: storedPath,
            originalFileName: req.file.originalname,
            uploadDate: new Date(),
            fileSize: req.file.size,
            status: "submitted",
            marks: 0  // Default marks set to 0
        };

        // Mark taskSubmissions as modified since it's a Mixed type
        user.markModified('taskSubmissions');
        await user.save();
        
        console.log("File uploaded successfully for task:", taskId);
        console.log("User taskSubmissions keys:", Object.keys(user.taskSubmissions));

        res.json({
            success: true,
            message: "File uploaded successfully.",
            taskId,
            file: user.taskSubmissions[taskId]
        });
    } catch (error) {
        console.error("Upload error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: "Error uploading file", error: error.message });
    }
};

// Get Task Submission
const getTaskSubmission = async (req, res) => {
    try {
        const taskId = req.query.taskId;
        if (!taskId || !ALLOWED_TASKS.has(taskId)) {
            return res.status(400).json({ success: false, message: "Invalid task reference." });
        }

        const user = await userModel.findById(req.user.userid);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        const taskSubmission = user?.taskSubmissions?.[taskId];

        if (!taskSubmission || !taskSubmission.filePath) {
            return res.status(404).json({ success: false, message: "No submission found for this task." });
        }

        // Ensure marks and status are included in response
        const submissionData = {
            ...taskSubmission,
            marks: taskSubmission.marks !== undefined ? taskSubmission.marks : 0,
            status: taskSubmission.status || "submitted"
        };

        res.json({
            success: true,
            taskId,
            submission: submissionData
        });
    } catch (error) {
        console.error("Error fetching submission:", error);
        res.status(500).json({ success: false, message: "Error fetching submission", error: error.message });
    }
};

// Delete Task Submission
const deleteTaskSubmission = async (req, res) => {
    try {
        const taskId = req.body.taskId;
        if (!taskId || !ALLOWED_TASKS.has(taskId)) {
            return res.status(400).json({ success: false, message: "Invalid task reference." });
        }

        const user = await userModel.findById(req.user.userid);
        const taskSubmission = user?.taskSubmissions?.[taskId];

        if (taskSubmission && taskSubmission.filePath) {
            const filePath = resolvePublicUploadPath(taskSubmission.filePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await userModel.findByIdAndUpdate(
            req.user.userid,
            {
                $unset: { [`taskSubmissions.${taskId}`]: 1 }
            },
            { new: true }
        );

        res.json({
            success: true,
            message: "Submission deleted successfully."
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ success: false, message: "Error deleting submission", error: error.message });
    }
};


const logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
}

// Public leaderboard data (JSON)
const getLeaderboardData = async (req, res) => {
    try {
        const users = await userModel.find({});

        const leaderboard = users.map(user => {
            const submissions = user.taskSubmissions || {};
            let totalMarks = 0;

            Object.values(submissions).forEach(submission => {
                if (submission && typeof submission.marks === "number") {
                    totalMarks += submission.marks;
                }
            });

            return {
                teamName: user.teamname || "N/A",
                city: user.city || "N/A",
                necId: user.email || "", // fallback identifier
                track: user.trackType || "Team",
                totalMarks
            };
        }).filter(entry => entry.totalMarks > 0);

        // Sort by marks (desc) and assign rank
        leaderboard.sort((a, b) => b.totalMarks - a.totalMarks);
        leaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error("Error building leaderboard:", error);
        res.status(500).json({
            success: false,
            message: "Error building leaderboard",
            error: error.message
        });
    }
};

// Public leaderboard page
const leaderboardPage = (req, res) => {
    res.render("leaderboard");
};

// Admin Panel Routes
const adminPanel = (req, res) => {
    res.render("adminpanel");
}

// Get all submissions for admin panel
const getAdminSubmissions = async (req, res) => {
    try {
        const users = await userModel.find({});
        const submissions = [];

        users.forEach(user => {
            if (user.taskSubmissions && typeof user.taskSubmissions === 'object') {
                Object.keys(user.taskSubmissions).forEach(taskId => {
                    const submission = user.taskSubmissions[taskId];
                    if (submission && submission.filePath) {
                        console.log("Found submission - Task ID:", taskId, "Team:", user.teamname);
                        submissions.push({
                            userId: user._id.toString(),
                            teamName: user.teamname || 'N/A',
                            taskId: taskId,
                            fileName: submission.fileName,
                            filePath: submission.filePath,
                            originalFileName: submission.originalFileName,
                            uploadDate: submission.uploadDate,
                            fileSize: submission.fileSize,
                            status: submission.status || 'submitted',
                            marks: submission.marks
                        });
                    }
                });
            }
        });
        
        console.log("Total submissions found:", submissions.length);
        console.log("Submission task IDs:", submissions.map(s => s.taskId));

        // Sort by upload date (newest first)
        submissions.sort((a, b) => {
            const dateA = new Date(a.uploadDate);
            const dateB = new Date(b.uploadDate);
            return dateB - dateA;
        });

        res.json({
            success: true,
            submissions: submissions
        });
    } catch (error) {
        console.error("Error fetching admin submissions:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching submissions",
            error: error.message
        });
    }
}

// Update marks and status for a submission
const updateMarks = async (req, res) => {
    try {
        const { userId, taskId, marks } = req.body;

        if (!userId || !taskId) {
            return res.status(400).json({
                success: false,
                message: "User ID and Task ID are required"
            });
        }

        if (marks === undefined || marks === null || marks === '') {
            return res.status(400).json({
                success: false,
                message: "Marks are required"
            });
        }

        const marksNum = parseFloat(marks);
        if (isNaN(marksNum) || marksNum < 0 || marksNum > 200) {
            return res.status(400).json({
                success: false,
                message: "Marks must be a number between 0 and 200"
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.taskSubmissions || !user.taskSubmissions[taskId]) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        // Update marks and status
        // Ensure taskSubmissions object exists
        if (!user.taskSubmissions) {
            user.taskSubmissions = {};
        }
        if (!user.taskSubmissions[taskId]) {
            user.taskSubmissions[taskId] = {};
        }
        
        user.taskSubmissions[taskId].marks = marksNum;
        user.taskSubmissions[taskId].status = "checked";

        // Mark the taskSubmissions as modified to ensure it's saved
        user.markModified('taskSubmissions');
        await user.save();

        res.json({
            success: true,
            message: "Marks updated successfully",
            submission: user.taskSubmissions[taskId]
        });
    } catch (error) {
        console.error("Error updating marks:", error);
        res.status(500).json({
            success: false,
            message: "Error updating marks",
            error: error.message
        });
    }
}










module.exports = {
    admin,
    adminlogin,
    adminPanel,
    getAdminSubmissions,
    updateMarks,
    forgetpassword,
    forgetpass,
    taskfourpointwo,
    taskfourpointone,
    tasktwopointfour,
    taskthreepointhree,
    taskthreepointwo,
    taskthreepointone,
    tasktwopointhree,
    tasktwopointwo,
    task2point1,
    task3,
    index,
    task2,
    task1,
    signup,
    ragister,
    home,
    loginuser,
    login,
    solotask,
    logout,
    teamtrack,
    mentor,
    associate,
    createteam,
    addmember,
    createMember,
    uploadTaskFile,
    getTaskSubmission,
    deleteTaskSubmission,
    getLeaderboardData,
    leaderboardPage
}