const express = require("express");
const path = require("path");
const app = express();
const DatabaseConnection = require("./config/DatabaseConnection");
const isLoggedin = require("./middleware/auth");
const isAdminLoggedin = require("./middleware/adminAuth");
const blockAdmin = require("./middleware/blockAdmin");
const upload = require("./middleware/multerConfig");


const cookieParser = require("cookie-parser");
const {
    admin,
    adminPanel,
    getAdminSubmissions,
    updateMarks,
    index,
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
    task1,
    task2,
    task3,
    task2point1,
    tasktwopointwo,
    tasktwopointhree,
    taskthreepointone,
    taskthreepointwo,
    taskthreepointhree,
    uploadTaskFile,
    getTaskSubmission,
    deleteTaskSubmission,
    tasktwopointfour,
    taskfourpointone,
    taskfourpointwo,
    forgetpassword,
    forgetpass,
    adminlogin,
    getLeaderboardData,
    leaderboardPage
} = require("./router/router")
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const handleTaskUpload = (req, res, next) => {
    const uploader = upload.single("file");
    uploader(req, res, function (err) {
        if (err) {
            const message = err.code === "LIMIT_FILE_SIZE"
                ? "File must be less than 10MB."
                : err.message || "File upload failed.";
            return res.status(400).json({ success: false, message });
        }
        next();
    });
};





app.get("/", home);
app.get("/home", isLoggedin, blockAdmin, index);
app.get("/signup", signup);
app.post("/ragister", ragister);

// Public leaderboard (no auth required)
app.get("/leaderboard", leaderboardPage);
app.get("/api/leaderboard", getLeaderboardData);

app.get("/admin", admin);
app.post("/adminlogin", adminlogin);
app.get("/adminpanel", isAdminLoggedin,adminPanel);
app.get("/admin/submissions", isAdminLoggedin, getAdminSubmissions);
app.post("/admin/update-marks", isAdminLoggedin, updateMarks);


app.get("/userlogin", loginuser);
app.post("/login", login);

app.get("/forgetpassword",forgetpassword);
app.post("/forgetpass",forgetpass);

app.get("/solotask",isLoggedin, blockAdmin, solotask);
app.get("/logout", logout);

app.get("/teamtrack",isLoggedin, blockAdmin, teamtrack);
app.get("/mentor",isLoggedin, blockAdmin, mentor);

app.get("/associate",isLoggedin, blockAdmin, associate);
app.get("/createteam",isLoggedin, blockAdmin, createteam);
app.get("/addmember",isLoggedin, blockAdmin, addmember);
app.post("/addmember",isLoggedin, blockAdmin, createMember);




app.get("/task1",isLoggedin, blockAdmin, task1);
app.get("/task2",isLoggedin, blockAdmin, task2);
app.get("/task3",isLoggedin, blockAdmin, task3);


app.get("/tasktwopointone",isLoggedin, blockAdmin, task2point1);
app.get("/tasktwopointwo",isLoggedin, blockAdmin, tasktwopointwo);
app.get("/tasktwopointhree",isLoggedin, blockAdmin, tasktwopointhree);
app.get("/tasktwopointfour",isLoggedin, blockAdmin, tasktwopointfour);


app.get("/taskthreepointone",isLoggedin, blockAdmin, taskthreepointone);
app.get("/taskthreepointwo",isLoggedin, blockAdmin, taskthreepointwo);
app.get("/taskthreepointhree",isLoggedin, blockAdmin, taskthreepointhree);

app.get("/taskfourpointone",isLoggedin, blockAdmin, taskfourpointone);
app.get("/taskfourpointwo",isLoggedin, blockAdmin, taskfourpointwo);

app.post("/upload-task-file", isLoggedin, blockAdmin, handleTaskUpload, uploadTaskFile);
app.get("/get-task-submission", isLoggedin, blockAdmin, getTaskSubmission);
app.post("/delete-task-submission", isLoggedin, blockAdmin, deleteTaskSubmission);


app.post("/debug-upload", handleTaskUpload, uploadTaskFile);




<<<<<<< HEAD
app.listen(4000, () => {
=======
app.listen(10000 , () => {
>>>>>>> f8e9961eb8b372bc37fe124a7bdb915c6747ace8
    console.log("Server is running on port 3000");
});
