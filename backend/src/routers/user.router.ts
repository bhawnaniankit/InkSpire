import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { signupInput, SignupInput, signinInput, SigninInput } from "@aj_devs/common-final"

const user = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_KEY: string
    }
}>(); //telling ts that env is string type

user.get("/:jwt", async (c) => {
    try{
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());
        const header = c.req.param("jwt");
        const response = await verify(header, c.env.JWT_KEY).catch(() => {
            c.status(403);
            return c.json({ error: "User Not found" });
        });
        const user = await prisma.user.findFirst({
            where: {
                id: response.id
            },
            select: {
                name: true,
                username: true,
                email: true
            }
        })
        if(!user){
            return c.json({
                error:"User Not found"
            },403)
        }
        return c.json(user);
    }
    catch(e){
        console.log("Internal server error in signup route in user router /:jwt route\n", e);
        return c.json({ error: "Internal Server Error" },500)
    }
});

user.post("/signup", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate())

        const payload: SignupInput = await c.req.json();
        const  res  = signupInput.safeParse(payload);
        if (!res.success) {
            return c.json({error:res.error.issues[0]?.message}, 411);
        }
        const user= await prisma.user.findFirst({
            where:{
                OR:[
                    {
                        username:payload.username
                    },
                    {
                        email:payload.email
                    }
                ]
            }
        })
        if(user){
            return c.json({
                error:"User already exist"
            },409);
        }
        const new_user = await prisma.user.create({
            data: {
                name: payload.name,
                username: payload.username,
                email: payload.email,
                password: payload.password
            }
        });
        const token = await sign({ id: new_user.id }, c.env.JWT_KEY);
        return c.json({ jwt: token });
    }
    catch (error) {
        console.log("Internal server error in signup route in user router\n", error);
        return c.json({ error: "Internal Server Error" },500)
    }
})

user.post("/signin", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());
        const payload: SigninInput = await c.req.json();
        const { success } = signinInput.safeParse(payload);
        if (!success) {
            return c.json({ error: "Invalid Inputs" }, 411);
        }
        const user = await prisma.user.findFirst({
            where: {
                username: payload.username
            }
        })
        if (!user) {
            return c.json({ error: "User Credentials Didn't Match" }, 403);
        }
        if(user.password!=payload.password){
            return c.json({ error: "User Credentials Didn't Match" }, 403);
        }
        const token = await sign({ id: user.id }, c.env.JWT_KEY);
        return c.json({ jwt: token });
    }
    catch (error) {
        console.log("Error in signin route\n", error);
        return c.json({ msg: "Internal Server Error" })
    }
})

export default user;