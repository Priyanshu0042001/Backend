const jwt = require('jsonwebtoken');
const Note = require('../model/Note.js');

// const blackList = new Map();
// const TOKEN_EXPIRY_TIME = 1000 * 60 * 60; // 1 hour in milliseconds

// Token verification middleware


// const trial = async (req, res, next) => {
//     try {

//     } catch (error) {

//     }
// }


const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ message: "No Token Provided" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: "Token format is incorrect" });
    }

    // Check if token is blacklisted
    // if (blackList.has(token)) {
    //   const expiryTime = blackList.get(token);
    //   if (Date.now() < expiryTime) {
    //     return res.status(403).json({ message: "Token is blacklisted" });
    //   } else {
    //     blackList.delete(token);
    //   }
    // }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token expired. Please log in again." });
            }
            return res.status(403).json({ message: "Invalid Token", error: err.message });
        }
        req.userId = decoded.id;
        next();
    });
};
// CREATE A NEW NOTES FUNCTION
async function add(req, res) {
    const { title, content } = req.body;
    try {
        const note = new Note({
            title,
            content,
            user: req.userId
        });
        await note.save();
        const now = Date.now();
        const options = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        const time = now.toLocaleString('en-US', options);
        return res.status(201).json({ message: "User notes saved successfully", time });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
// GET ALL NOTES FUNCTION
async function display(req, res) {

    console.log(`API HITTED`);

    try {
        const notes = await Note.find({ user: req.userId });
        console.log("NOTES SEND");
        return res.status(200).json(notes);

    } catch (error) {
        console.error('Error retrieving notes:', error.message);
        return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
    }
}
// DELETE NOTES FUNCTION
async function deleteNotes(req, res) {
    try {
        const note = await Note.findByIdAndDelete({ _id: req.params.id, user: req.userId });
        if (!note) {
            return res.status(400).json({ message: "ERROR DELETING NOTES" });
        }
        return res.status(200).json({ message: "Successfully Deleted Notes" });
    } catch (error) {
        return res.status(500).json({ message: "INTERNAL SERVER ERRRO" });
    }
}
// UPDATE FUNCTION NOTES:
async function UpdateNotes(req, res) {
    const { title, content } = req.body;
    const noteId = req.params.id;

    console.log("UPDATE API HITTED", req.body);

    try {
        const note = await Note.findOneAndUpdate(
            { _id: noteId, user: req.userId },
            { title, content },
            { new: true } // Return the updated document
        );

        if (!note) {
            return res.status(404).json({ message: "Note not found or you don't have permission to update this note" });
        }

        console.log("NOTES UPDATED!!");
        const now = Date.now();
        const options = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        const time = now.toLocaleString('en-US', options);
        return res.status(200).json({ message: "Note updated successfully", note, time });

    } catch (error) {
        console.error("ERROR UPDATING NOTE", error);
        return res.status(500).json({ message: "Error updating note, please try again later" });
    }
}
async function deleteAll(req, res) {
    try {
        const result = await Note.deleteMany({ user: req.userId });
        console.log("ALL NOTES DELETED SUCCESSFULLY!!");
        return res.status(200).json({ message: 'ALL NOTES DELETED', deletedCount: result.deletedCount });
    } catch (error) {
        return res.status(500).json({ message: "CANNOT DELETE ALL NOTES" });
    }
}
async function searchQuery(req, res) {
    const { query } = req.query;
    try {
        if (!query) {
            return res.status(400).json({ message: "NO RESULT FOUND FOR THESE" });
        }
        const notes = await Note.find({
            user: req.userId,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        })
        return res.status(200).json(notes);
    } catch (error) {
        return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
    }

}

//exporting the function in our NotesRoutes
module.exports = { add, display, deleteNotes, UpdateNotes, deleteAll, searchQuery };
