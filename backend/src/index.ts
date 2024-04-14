import { Hono } from 'hono'
import user from './routers/user.router'
import blog from './routers/blog.router'
import { cors } from 'hono/cors'
const app = new Hono()

app.use("/api/*", cors());
app.route("/api/v1/user", user);
app.route("api/v1/blog", blog);

export default app;