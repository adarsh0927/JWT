const express = require ('express')
const jwt = require ('jsonwebtoken')
const dotenv=require('dotenv')
const ejs = require('ejs')


dotenv.config()
const app = express()
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
const PORT = 4000

app.use(express.json())

const secretkey=process.env.mySecretKey


const users = [{
    id: "1",
    username: "Adarsh",
    password: "adarsh",
    isAdmin: true
},
{
    id: "2",
    username: "Bunny",
    password: "bunny",
    isAdmin: false
}
]
const verifyUser = (req, res, next) => {
    const userToken = req.headers.authorization
    if (userToken) {
        const token = userToken.split(" ")[1]
        jwt.verify(token, secretkey, (err, user) => {
            if (err) {
                return res.status(403).json({ err: "token is not valid" })
            }
            req.user = user
            next()
        })

    } else {
        res.status(401).json("you are not authenticated")
    }
}
app.post('/api/login',(req,res)=>{
    const {username , password}= req.body

    const user=users.find((person)=>{
        return person.username === username && person.password === password   
    })
    if(user){

        const accessToken= jwt.sign({
            id:user.id,
            username:user.username,
            isAdmin:user.isAdmin
        },secretkey )
        res.json({
            username:user.username,
            isAdmin:user.isAdmin,
            accessToken
        })
    }
    else{
        res.status(401).json("user credentials not matched")
    }
})

app.delete('/api/users/:userId', verifyUser, (req, res) => {

    if (req.user.id === req.params.userId || req.user.isAdmin) {
        res.status(200).json("user is deleted successfull")
    } else {
        res.status(401).json("you are not allowed to delete")
    }

})
app.get('/adarsh',(req,res)=>{
    res.render("adarsh")
})
app.get('/bunny',(req,res)=>{
    res.render("bunny")
})
app.get('/api/login/:userId',(req,res)=>{
    const userId= req.params.userId
    if(userId){
        if(userId ==="1")
        {
            res.redirect('/adarsh')
        }else if(userId ==="2"){
            res.redirect('/bunny')
        }

    }
    else{
        res.status(403).json("user not found")

    }
})
app.post('/api/logout',(req,res)=>{
    const userTokens = req.headers.authorization
    if(userTokens){
        const token = userTokens.split(" ")[1]
        if(token){
            let allTokens = []
            const tokenIndex = allTokens.indexOf(token)
            if(tokenIndex !== -1){
                allTokens.splice(tokenIndex ,1)
                res.status(200).json("logedout succesfully")
                res.redirect("/")

            }else{
                res.status(400).json("You are not valid user")
            }
        }else{
            res.status(400).json("Token not found")
        }

    }else{
        res.status(400).json("you are not authenticated")

    }
})
app.get('/api/logout',(req,res)=>{
    res.redirect('/')

})
app.get('/',(req,res)=>{
res.render('welcome')
})


app.listen(PORT , ()=>{
    console.log(`server started and running on ${PORT}`)
})