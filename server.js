





// 🔹 Send Notification API (FCM v1)
app.post("/send-notification", async (req, res) => {
    console.log("Request Body:", req.body);
    try {
        const { email, token } = req.body;

        const message = {
            token: token, // Device FCM Token
            notification: {
                title: "Here is your new notification",
                body: "Notification Body",
            },
            data: {
                extraData: "Custom Data For User",
            },
        };

        const response = await admin.messaging().send(message);
        res.status(200).json({ success: true, message: "Notification sent!", response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🔹 Socket.io connection
io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("subscribeToFCM", async (data) => {
        console.log("FCM Info:", data);
        try {
            const message = {
                token: data.token,
                notification: {
                    title: "Here is new title",
                    body: "Here is new body",
                },
                data: {
                    extraData: "Custom Data",
                },
            };
            const response = await admin.messaging().send(message);
            socket.emit("notificationSent", { success: true, message: "Notification sent!", response });
        } catch (error) {
            socket.emit("notificationSent", { success: false, error: error.message });
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// 🔹 Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});