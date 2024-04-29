import z from "zod"

export const createBlogInput = z.object({
    title: z.string().min(5),
    content: z.string().min(5)
})

export const updateBlogInput = z.object({
    id: z.string(),
    title: z.string().min(5),
    content: z.string().min(5)
})


export const signupInput = z.object({
    name: z.string().min(3, { message: "name must be of length 3" }),
    username: z.string().min(3,{message:"Username should have atleast 3 length"}),
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(8, { message: "Password must have atleast 8 character" })
});

export const signinInput = z.object({
    username: z.string().min(3,{message:"Username should have atleast 3 length"}),
    password: z.string().min(8, { message: "Password must have atleast 8 character" })
});

export type SignupInput = z.infer<typeof signupInput>
export type SigninInput = z.infer<typeof signinInput>
export type CreateBlogInput = z.infer<typeof createBlogInput>
export type UpdateBlogInput = z.infer<typeof updateBlogInput>