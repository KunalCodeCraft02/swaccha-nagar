const express = require("express");
const path = require("path");
const app = express();
const DatabaseConnection = require("./config/DatabaseConnection");
const isLoggedin = require("./middleware/auth");
const upload = require("./middleware/multerConfig");


const cookieParser = require("cookie-parser");
const { index, signup, ragister, home, loginuser, login, solotask, logout, teamtrack, mentor, associate, createteam, addmember, createMember, task1, task2, task3, task2point1, tasktwopointwo, tasktwopointhree, taskthreepointone, taskthreepointwo, taskthreepointhree, uploadTaskFile, getTaskSubmission, deleteTaskSubmission, tasktwopointfour, taskfourpointone, taskfourpointwo, forgetpassword, forgetpass } = require("./router/router")
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
app.get("/home", isLoggedin, index);
app.get("/signup", signup);
app.post("/ragister", ragister);

app.get("/userlogin", loginuser);
app.post("/login", login);

app.get("/forgetpassword",forgetpassword);
app.post("/forgetpass",forgetpass);

app.get("/solotask",isLoggedin,solotask);
app.get("/logout", logout);

app.get("/teamtrack",isLoggedin,teamtrack);
app.get("/mentor",isLoggedin,mentor);

app.get("/associate",isLoggedin,associate);
app.get("/createteam",isLoggedin,createteam);
app.get("/addmember",isLoggedin,addmember);
app.post("/addmember",isLoggedin,createMember);




app.get("/task1",isLoggedin,task1);
app.get("/task2",isLoggedin,task2);
app.get("/task3",isLoggedin,task3);


app.get("/tasktwopointone",isLoggedin,task2point1);
app.get("/tasktwopointwo",isLoggedin,tasktwopointwo);
app.get("/tasktwopointhree",isLoggedin,tasktwopointhree);
app.get("/tasktwopointfour",isLoggedin,tasktwopointfour);


app.get("/taskthreepointone",isLoggedin,taskthreepointone);
app.get("/taskthreepointwo",isLoggedin,taskthreepointwo);
app.get("/taskthreepointhree",isLoggedin,taskthreepointhree);

app.get("/taskfourpointone",isLoggedin,taskfourpointone);
app.get("/taskfourpointwo",isLoggedin,taskfourpointwo);

app.post("/upload-task-file", isLoggedin, handleTaskUpload, uploadTaskFile);
app.get("/get-task-submission", isLoggedin, getTaskSubmission);
app.post("/delete-task-submission", isLoggedin, deleteTaskSubmission);


app.post("/debug-upload", handleTaskUpload, uploadTaskFile);




app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
