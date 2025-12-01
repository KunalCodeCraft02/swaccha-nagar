// Middleware to block admin users from accessing user routes
const blockAdmin = (req, res, next) => {
    // Check if user is logged in and is admin
    if (req.user && req.user.userid === "admin") {
        // Check if it's an API request
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(403).json({ 
                success: false, 
                message: "Admin users cannot access user routes. Please use the admin panel." 
            });
        }
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Access Denied</title>
            </head>
            <body>
                <script>
                    alert("Admin users cannot access user routes. Redirecting to admin panel...");
                    window.location.href = "/adminpanel";
                </script>
            </body>
            </html>
        `);
    }
    next();
};

module.exports = blockAdmin;

