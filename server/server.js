const mongoose = require("mongoose");
const Document = require("./models/Document")

mongoose.connect("mongodb://localhost:27017/realtime-doc",{
}).then(value=>{
    console.log("Connected to mongoose...")
}).catch(err=>{
    console.log(err)
})
const defaultValue = ""

const io = require("socket.io")(5000,{
    cors : {
        origin : "http://localhost:3000",
        methods : ["GET","POST"]
    }
})

io.on("connection",socket=>{
    console.log("connected")
    socket.on("get-document",async (documentId)=>{
        const document = await findOrCreateDocument(documentId)
        socket.join(documentId)
        socket.emit("load-document", document.data)
        socket.on("send-changes",(delta)=>{
            console.log(delta);
            socket.broadcast.to(documentId).emit("receive-changes",delta);
        })
        socket.on("save-document",async data=>{
            await Document.findByIdAndUpdate(documentId, { data }).then(value=>console.log("updated"))
        })
    })
})

async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
  }