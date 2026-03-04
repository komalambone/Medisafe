// Mock Supabase client bridging to local Express API
// Each .from() call creates a fresh chain so intermediate awaits don't leak

function createMockChain(): any {
    const chain: any = {
        select: () => chain,
        eq: () => chain,
        gte: () => chain,
        lte: () => chain,
        order: () => chain,
        limit: () => chain,
        match: () => chain,
        single: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => chain,
        then: (resolve: any, reject?: any) => Promise.resolve({ data: null, error: null }).then(resolve, reject),
    };
    return chain;
}

export const supabase = {
    auth: {
        signInWithPassword: async ({ email }: any) => {
            // In a bridged mode, we'd theoretically call /api/login, but here we just simulate
            return {
                data: { session: { user: { id: 'user_123', email } } },
                error: null,
            };
        },
        signUp: async ({ email }: any) => ({
            data: { session: { user: { id: 'user_123', email } } },
            error: null,
        }),
        resetPasswordForEmail: async () => ({ error: null }),
        signInWithOAuth: async () => ({ error: null }),
        getSession: async () => {
            try {
                const response = await fetch('/api/me');
                const data = await response.json();
                if (data.authenticated) {
                    return {
                        data: {
                            session: {
                                user: {
                                    id: data.user.id,
                                    email: data.user.email
                                }
                            }
                        },
                        error: null
                    };
                }
            } catch (_e) { /* ignore */ }
            return { data: { session: null }, error: null };
        },
        signOut: async () => ({ error: null }),
        onAuthStateChange: (_event: any, _callback: any) => ({
            data: { subscription: { unsubscribe: () => { } } },
        }),
    },
    from: (_table: string) => createMockChain(),
    storage: {
        from: (_bucket: string) => ({
            upload: async () => ({ error: null }),
            getPublicUrl: (_path: string) => ({
                data: { publicUrl: '' },
            }),
        }),
    },
} as any;
