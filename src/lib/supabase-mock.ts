// Mock Supabase client until real integration is configured
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => ({ 
      data: { subscription: { unsubscribe: () => {} } } 
    }),
    signUp: async (credentials: any) => ({ 
      data: { user: null, session: null }, 
      error: { message: "Supabase não configurado ainda" } 
    }),
    signInWithPassword: async (credentials: any) => ({ 
      data: { user: null, session: null }, 
      error: { message: "Supabase não configurado ainda" } 
    }),
    signOut: async () => ({ error: null }),
  },
};

// Mock types
export interface Session {
  user: User;
}

export interface User {
  id: string;
  email?: string;
}