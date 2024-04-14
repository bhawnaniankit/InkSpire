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
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    const header = c.req.param("jwt");
    const response = await verify(header, c.env.JWT_KEY).catch(() => {
        return c.json({ erro: "User Not found" }, 403);
    });
    console.log(response);
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
    console.log(user);
    return c.json(user);
});

user.post("/signup", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate())

        const payload: SignupInput = await c.req.json();
        const { success } = signupInput.safeParse(payload);
        if (!success) {
            return c.json({ message: "Invalid Inputs" }, 411);
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
        return c.json({ "msg": "error" })
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
            return c.json({ message: "Invalid Inputs" }, 411);
        }
        const user = await prisma.user.findFirst({
            where: {
                username: payload.username,
                password: payload.password
            }
        })
        if (!user) {
            return c.json({ "error": "user does'nt exist" });
        }
        const token = await sign({ id: user.id }, c.env.JWT_KEY);
        return c.json({ jwt: token });
    }
    catch (error) {
        console.log("Error in signin route\n", error);
        return c.json({ msg: "Internal Server error" })
    }
})

export default user;