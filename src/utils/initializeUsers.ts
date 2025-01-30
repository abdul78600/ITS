import { supabase } from '../lib/supabaseClient';
import { defaultUsers } from './defaultUsers';

// Utility function for delay with exponential backoff
const delay = (attempt: number) => new Promise(resolve => 
  setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000))
);

// Utility function to check if user exists
async function checkUserExists(email: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return !!data;
  } catch (err) {
    console.error('Error checking user existence:', err);
    return false;
  }
}

export async function initializeUsers() {
  try {
    // Initial delay to ensure database is ready
    await delay(0);

    // Create default users sequentially with proper error handling
    for (const userData of defaultUsers) {
      try {
        // Check if user already exists
        const exists = await checkUserExists(userData.email);
        if (exists) {
          console.log(`User ${userData.email} already exists`);
          continue;
        }

        // Try to create user with retries
        let success = false;
        let attempt = 0;
        const maxAttempts = 5;

        while (!success && attempt < maxAttempts) {
          try {
            // Wait with exponential backoff between attempts
            if (attempt > 0) {
              await delay(attempt);
            }

            const { data: authData, error: signUpError } = await supabase.auth.signUp({
              email: userData.email,
              password: userData.password,
              options: {
                data: {
                  name: userData.name,
                  role: userData.role,
                  department: userData.department,
                  position: userData.position
                }
              }
            });

            if (signUpError) {
              throw signUpError;
            }

            if (!authData.user) {
              throw new Error('No user data returned');
            }

            // Wait for user to be fully created
            await delay(1);

            // Verify user was created
            const exists = await checkUserExists(userData.email);
            if (!exists) {
              throw new Error('User verification failed');
            }

            success = true;
            console.log(`Successfully created user: ${userData.email}`);

          } catch (error: any) {
            attempt++;
            console.warn(`Attempt ${attempt} failed for ${userData.email}:`, error.message);

            if (error.status === 429) {
              // Rate limit hit, wait longer
              await delay(attempt + 2);
            }

            if (attempt === maxAttempts) {
              console.error(`Failed to create user ${userData.email} after ${maxAttempts} attempts`);
            }
          }
        }

        // Wait between users to avoid rate limits
        await delay(1);

      } catch (error) {
        console.error(`Error processing user ${userData.email}:`, error);
        await delay(1);
      }
    }

  } catch (error) {
    console.error('Error in initializeUsers:', error);
  }
}