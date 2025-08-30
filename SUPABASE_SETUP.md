# Supabase Backend Setup Guide for Project Aura

This guide will walk you through setting up Supabase as the backend for your Project Aura React application.

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Basic knowledge of SQL and database concepts

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/sign up
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `project-aura` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Create a `.env` file in your project root (copy from `env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the migration files in order:

### First, run the initial schema migration:
```sql
-- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
```

### Then, run the storage buckets migration:
```sql
-- Copy and paste the contents of supabase/migrations/002_storage_buckets.sql
```

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your authentication settings:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/**`
3. Go to **Authentication** → **Providers**
4. Enable **Email** provider
5. Optionally enable other providers (Google, GitHub, etc.)

## Step 6: Set Up Row Level Security (RLS)

The migration files already set up RLS policies, but you can verify them:

1. Go to **Authentication** → **Policies**
2. Ensure the following policies are created:
   - Users can view/update their own profile
   - Users can manage their own SOS alerts
   - Users can manage their own emergency contacts
   - Users can manage their own audio files

## Step 7: Test Your Connection

1. Start your development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`
3. Try to sign up with a new account
4. Check the Supabase dashboard to see if the user was created

## Step 8: Deploy to Production

When deploying to production:

1. Update your environment variables with production URLs
2. Update Supabase authentication settings with your production domain
3. Run the migrations on your production database

## Database Schema Overview

### Users Table
- `id`: Unique user identifier
- `email`: User's email address
- `full_name`: User's full name
- `phone_number`: User's phone number
- `emergency_contacts`: Array of emergency contact IDs
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### SOS Alerts Table
- `id`: Unique alert identifier
- `user_id`: Reference to user who triggered the alert
- `location`: JSON object with latitude and longitude
- `status`: Alert status (active, resolved, false_alarm)
- `created_at`: Alert creation timestamp
- `resolved_at`: Alert resolution timestamp
- `audio_url`: URL to recorded audio file
- `transcription`: Text transcription of audio

### Emergency Contacts Table
- `id`: Unique contact identifier
- `user_id`: Reference to user who owns this contact
- `name`: Contact's full name
- `phone_number`: Contact's phone number
- `relationship`: Relationship to user
- `is_primary`: Whether this is the primary emergency contact
- `created_at`: Contact creation timestamp

## Storage Buckets

- **audio-files**: Stores recorded audio files for SOS alerts
- Files are organized by user ID: `{user_id}/{timestamp}_audio.webm`
- Only authenticated users can access their own files

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Supabase handles user authentication securely
- **API Keys**: Environment variables keep sensitive data secure
- **CORS**: Configured to allow only your domains

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check your `.env` file exists and has correct values
   - Restart your development server after adding environment variables

2. **"Invalid API key"**
   - Verify your anon key is correct
   - Check that you're using the anon key, not the service role key

3. **"RLS policy violation"**
   - Ensure the user is authenticated
   - Check that RLS policies are properly set up
   - Verify the user ID matches the data they're trying to access

4. **"Bucket not found"**
   - Run the storage buckets migration
   - Check that the bucket name matches exactly

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Visit the [Supabase community](https://github.com/supabase/supabase/discussions)
- Review the [React integration guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

## Next Steps

After setting up the basic backend:

1. **Add more features**: Implement emergency contact management
2. **Enhance security**: Add phone number verification
3. **Scale up**: Consider adding real-time notifications
4. **Monitor**: Use Supabase analytics to track usage
5. **Backup**: Set up automated database backups

## Support

If you encounter issues with this setup:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure the database schema is properly migrated
4. Check the browser console for error messages
5. Verify your Supabase project is active and not paused

Happy coding! 🚀
