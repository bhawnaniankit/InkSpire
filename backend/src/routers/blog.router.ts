import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono } from 'hono'
import { verify } from 'hono/jwt'
import { createBlogInput, CreateBlogInput, updateBlogInput, UpdateBlogInput } from "@aj_devs/common-final"
import { cors } from 'hono/cors';

const blog = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_KEY: string
    },
    Variables: {
        id: string
    }
}>();
// blog.use(cors())

blog.use("/*", async (c, next) => {
    const header = c.req.header("Authorization") || "";
    const response = await verify(header, c.env.JWT_KEY).catch(() => {
        return c.json({ erro: "Unauthorized" }, 403);
    });
    if (response.id) {
        c.set("id", response.id)
        await next();
    }
    else {
        return c.json({ erro: "Unauthorized" }, 403);
    }
})

blog.post("/", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const payload: CreateBlogInput = await c.req.json();
        const { success } = createBlogInput.safeParse(payload);
        if (!success) {
            return c.json({ message: "Invalid Inputs" }, 411);
        }
        const blog = await prisma.post.create({
            data: {
                title: payload.title,
                content: payload.content,
                userId: c.get("id") || ""
            }
        });
        return c.json({ id: blog.id });
    }
    catch (error) {
        return c.json({ msg: "Internal sever error " }, 500);
    }

})

blog.put("/", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const payload: UpdateBlogInput = await c.req.json();
        const { success } = updateBlogInput.safeParse(payload);
        if (!success) {
            return c.json({ message: "Invalid Inputs" }, 411);
        }
        const blog = await prisma.post.update({
            where: {
                id: payload.id,
                userId: c.get("id")
            },
            data: {
                title: payload.title,
                content: payload.content
            }
        });
        return c.json({ id: blog.id });
    }
    catch (error) {
        console.log(error)
        return c.json({ msg: "Internal sever error " }, 500);
    }
})

// add pagination
blog.get("/bulk", async (c) => {
    try{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    
    const payload=c.req.query()
    const blogs = await prisma.post.findMany({
        where: {
            published: true
        },
        select: {
            id: true,
            content: true,
            title: true,
            createdAt: true,
            author: {
                select: {
                    name: true
                }
            }
        },
        skip:parseInt(payload.skip),
        take:parseInt(payload.take)
    });
        return c.json(blogs);
    }
    catch(e){
        console.log(e);
        return c.json(e,401)
    }
})

blog.get("/:id", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const blogId = c.req.param("id");

        const blog = await prisma.post.findFirst({
            where: {
                id: blogId
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true
                    }
                }
            }
        });
        return c.json({ blog });
    }
    catch (error) {
        return c.json({ msg: "Internal sever error " }, 500);
    }
})

blog.put("/publish/:id", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const id = c.req.param("id");

        const blog = await prisma.post.update({
            where: {
                id
            },
            data: {
                published: true
            }
        })
        return c.json({ msg: "Blog Published" });
    }
    catch (e) {
        return c.json({ error: "Internal Server error" }, 500);
    }
})

export default blog;