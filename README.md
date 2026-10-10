# Oxford Research Hub: Setup (about 40 minutes)

## 1. Supabase (database, login, files)
1. supabase.com > New project (free tier). Save the database password.
2. SQL Editor > New query > paste all of `supabase.sql` > Run.
3. Run this with your 5 members' real Google emails (first one is admin):
   insert into team_emails values ('you@gmail.com','admin'),('m2@gmail.com','member'),('m3@gmail.com','member'),('m4@gmail.com','member'),('m5@gmail.com','member');
4. Project Settings > API: copy **Project URL** and the **anon public key**.

## 2. Google sign-in
1. console.cloud.google.com > create project > APIs & Services > OAuth consent screen (External) > then Credentials > Create OAuth client ID > Web application.
2. Authorized redirect URI: the callback URL shown in Supabase > Authentication > Providers > Google.
3. Paste the Client ID and Secret into that Supabase Google provider and enable it.

## 3. Gemini key
aistudio.google.com > Get API key. If the model name stops working, set env var GEMINI_MODEL to a current model listed in AI Studio.

## 4. Deploy on Vercel
1. Push this folder to a new GitHub repo.
2. vercel.com > Add New Project > import the repo > Framework: Other > Deploy.
3. Settings > Environment Variables: SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY. Redeploy.
4. Supabase > Authentication > URL Configuration: set Site URL and add a Redirect URL = your Vercel domain.

## 5. Test before sharing
Sign in with 2 accounts, add an idea with a real DOI and one fake source, upload a photo, run Check sources, Score, Gap finder, Report > PDF.

## Already ran the old supabase.sql? Add the new column
Run once in the SQL Editor: alter table ideas add column research text;
Videos: the free Supabase plan limits each file to about 50 MB (check the current limit in Supabase). Longer videos: upload to YouTube/Drive and paste the link into Sources.
