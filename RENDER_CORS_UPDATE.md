# Update Render CORS Configuration

Now that the frontend is deployed, you need to update the `CORS_ORIGIN` environment variable on Render to allow your Vercel app to communicate with your backend.

## Steps

1.  Go to your **Render Dashboard**.
2.  Select your **Web Service** (the backend API).
3.  Click on **Environment**.
4.  Find the `CORS_ORIGIN` variable.
5.  Update its value to include your new Vercel URL. It should look like this (comma-separated):

    ```text
    http://localhost:3000,https://glotrade-ecom-web.vercel.app
    ```

6.  Click **Save Changes**.

Render will automatically restart your service. Once it's back up (usually 1-2 minutes), your frontend at `https://glotrade-ecom-web.vercel.app` will be able to talk to the backend!
