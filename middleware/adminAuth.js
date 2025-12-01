const jwt = require("jsonwebtoken");

const isAdminLoggedin = (req, res, next) => {
    if (!req.cookies.token) {
        // Check if it's an API request
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ success: false, message: "You must be logged in as admin" });
        }
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Required</title>
            </head>
            <body>
                <script>
                    alert("You must be logged in as admin");
                    window.location.href = "/admin";
                </script>
            </body>
            </html>
        `);
    } else {
        try {
            let data = jwt.verify(req.cookies.token, "thenameiskunalkailasbodkhe");
            req.user = data;
            
            // Check if user is admin
            if (!data.userid || data.userid !== "admin") {
                // Check if it's an API request
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    return res.status(403).json({ success: false, message: "Access denied. Admin only." });
                }
                return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Access Denied</title>
                    </head>
                    <body>
                        <script>
                            alert("Access denied. Admin only.");
                            window.location.href = "/userlogin";
                        </script>
                    </body>
                    </html>
                `);
            }
            
            next();
        } catch (e) {
            // Check if it's an API request
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(401).json({ success: false, message: "Invalid token" });
            }
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Authentication Error</title>
                </head>
                <body>
                    <script>
                        alert("Invalid token. Please login again");
                        window.location.href = "/admin";
                    </script>
                </body>
                </html>
            `);
        }
    }
};

module.exports = isAdminLoggedin;

