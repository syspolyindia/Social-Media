import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({limit: "16kb"})) // any data that is being sent to us in JSON format would have a limit of 16kb, data of larger size is not permitted.

app.use(express.urlencoded({extended:true, limit:"16kb"})); //To parse the request body (if the request sent is in such format that it needs to be parsed) into javascript object.

app.use(express.static(path.join(__dirname, '../public')));

app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

app.use(cookieParser());


import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import referralRouter from './routes/referral.route.js';
import subscriptionRouter from './routes/subscription.route.js';
import likeRouter from './routes/like.route.js';
import commentRouter from './routes/comment.route.js'


app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/referrals', referralRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/comments', commentRouter);


import adminRouter from './routes/admin/admin.route.js';
import pmRouter from './routes/admin/pm.route.js';
import umRouter from './routes/admin/um.route.js';
import rmRouter from './routes/admin/rm.route.js';
import cmRouter from './routes/admin/cm.route.js';
import smRouter from './routes/admin/sm.route.js';
import dashboardRouter from './routes/admin/dashboard.route.js';

app.use('/api/v1/admins', adminRouter);
app.use('/api/v1/post-management', pmRouter);
app.use('/api/v1/user-management', umRouter);
app.use('/api/v1/referral-management', rmRouter);
app.use('/api/v1/comment-management', cmRouter);
app.use('/api/v1/subscription-management', smRouter);
app.use('/api/v1/dashboard', dashboardRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
});


export {app};